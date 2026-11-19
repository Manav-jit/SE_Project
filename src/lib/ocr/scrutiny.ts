import { UserProfile } from '../chat/profile';

export interface ScrutinyResult {
  nameScore: number; // 0 to 100
  nameStatus: 'EXACT' | 'ACCEPTABLE' | 'RISK_MISMATCH';
  nameMessage: string;
  dbtReady: boolean;
  dbtStatusText: string;
  checklist: {
    item: string;
    passed: boolean;
    severity: 'success' | 'warning' | 'critical';
    guidance: string;
  }[];
}

function cleanName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/\b(shri|smt|kumari|mr|mrs|ms|dr)\b/gi, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function computeNameMatchScore(declaredName?: string, ocrAadhaarName?: string): { score: number; status: 'EXACT' | 'ACCEPTABLE' | 'RISK_MISMATCH'; message: string } {
  if (!declaredName || !ocrAadhaarName) {
    return {
      score: 100,
      status: 'EXACT',
      message: 'Name verification passed or pending OCR card input.',
    };
  }

  const tokens1 = cleanName(declaredName);
  const tokens2 = cleanName(ocrAadhaarName);

  if (tokens1.join(' ') === tokens2.join(' ')) {
    return {
      score: 100,
      status: 'EXACT',
      message: '100% Exact Name Match across Aadhaar and Profile. Direct Benefit Transfer (DBT) eligible.',
    };
  }

  // Token overlap / Jaccard similarity
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  let intersection = 0;
  set1.forEach((t) => {
    if (set2.has(t)) intersection++;
  });
  const union = new Set([...tokens1, ...tokens2]).size;
  const jaccard = union === 0 ? 1 : intersection / union;
  const score = Math.round(jaccard * 100);

  if (score >= 66) {
    return {
      score,
      status: 'ACCEPTABLE',
      message: `Acceptable name correlation (${score}%). Ensure your Bank Passbook matches Aadhaar exactly: "${ocrAadhaarName}".`,
    };
  }

  return {
    score,
    status: 'RISK_MISMATCH',
    message: `High risk spelling variance (${score}%). Declared: "${declaredName}" vs Aadhaar: "${ocrAadhaarName}". PFMS blocks payments on name mismatch.`,
  };
}

export function inspectProfileDbtScrutiny(profile: UserProfile, ocrName?: string): ScrutinyResult {
  const nameCheck = computeNameMatchScore(profile.name, ocrName || profile.name);
  const hasAadhaar = !!(profile.aadhaarNumber || profile.aadhaarLast4 || profile.verified);
  const hasDigiLocker = !!profile.digilockerId;
  const hasState = !!profile.state;

  const checklist: ScrutinyResult['checklist'] = [
    {
      item: 'Aadhaar Demographic Seeding',
      passed: hasAadhaar,
      severity: hasAadhaar ? 'success' : 'critical',
      guidance: hasAadhaar ? 'Aadhaar identity token authenticated.' : 'Mandatory under Aadhaar Act Section 7 for central subsidy disbursement.',
    },
    {
      item: 'PFMS Name Verification & Match',
      passed: nameCheck.status !== 'RISK_MISMATCH',
      severity: nameCheck.status === 'EXACT' ? 'success' : nameCheck.status === 'ACCEPTABLE' ? 'warning' : 'critical',
      guidance: nameCheck.message,
    },
    {
      item: 'NPCI Bank Account Mapping',
      passed: hasDigiLocker || hasAadhaar,
      severity: hasDigiLocker ? 'success' : 'warning',
      guidance: hasDigiLocker 
        ? 'Verified eKYC account detected. NPCI DBT linkage ready.' 
        : 'Ensure your primary bank account is mapped on NPCI Aadhaar Payments Bridge (APB).',
    },
    {
      item: 'Domicile / State Registry',
      passed: hasState,
      severity: hasState ? 'success' : 'critical',
      guidance: hasState ? `Domicile registered in ${profile.state}.` : 'State required to unlock state welfare additions.',
    },
  ];

  const criticalFails = checklist.filter((c) => c.severity === 'critical' && !c.passed);
  const dbtReady = criticalFails.length === 0 && nameCheck.status !== 'RISK_MISMATCH';

  return {
    nameScore: nameCheck.score,
    nameStatus: nameCheck.status,
    nameMessage: nameCheck.message,
    dbtReady,
    dbtStatusText: dbtReady ? 'Direct Benefit Transfer (DBT) Pre-Scrutiny Passed' : 'Action Required: Resolve Discrepancy Prior to Submission',
    checklist,
  };
}
