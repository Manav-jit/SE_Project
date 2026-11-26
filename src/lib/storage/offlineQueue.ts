export interface QueuedSubmission {
  tempId: string;
  schemeId: string;
  schemeName: string;
  category: string;
  applicantName: string;
  mobile?: string;
  aadhaarLast4?: string;
  state: string;
  submissionMode: 'ONLINE' | 'CSC_OFFLINE';
  sanctionedAmount?: string;
  queuedAt: string;
}

export const OFFLINE_QUEUE_KEY = 'schemesaathi_offline_submissions';
export const OFFLINE_SYNC_EVENT = 'schemesaathi:offline-sync';

export function getQueuedSubmissions(): QueuedSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineSubmission(
  submission: Omit<QueuedSubmission, 'tempId' | 'queuedAt'>
): QueuedSubmission {
  const tempId = `OFFLINE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const item: QueuedSubmission = {
    ...submission,
    tempId,
    queuedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const current = getQueuedSubmissions();
    current.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent(OFFLINE_SYNC_EVENT, { detail: { action: 'queued', count: current.length } })
    );
  }

  return item;
}

export async function flushOfflineSubmissions(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined') return { synced: 0, failed: 0 };
  const queue = getQueuedSubmissions();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remaining: QueuedSubmission[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: item.schemeId,
          schemeName: item.schemeName,
          category: item.category,
          applicantName: item.applicantName,
          mobile: item.mobile,
          aadhaarLast4: item.aadhaarLast4,
          state: item.state,
          submissionMode: item.submissionMode,
          sanctionedAmount: item.sanctionedAmount,
        }),
      });

      if (res.ok) {
        synced++;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  window.dispatchEvent(
    new CustomEvent(OFFLINE_SYNC_EVENT, {
      detail: { action: 'flushed', synced, remaining: remaining.length },
    })
  );
  return { synced, failed: remaining.length };
}
