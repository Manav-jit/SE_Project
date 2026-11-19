'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, MessageCircle, Printer, X, Check } from 'lucide-react';
import { UserProfile, saveStoredProfile } from '@/lib/chat/profile';

interface QueuedCitizen {
  id: string;
  name: string;
  role: string;
  profile: UserProfile;
}

const DEFAULT_QUEUE: QueuedCitizen[] = [
  {
    id: 'citizen-1',
    name: 'Ramesh Kumar',
    role: 'Farmer (1.5 ha)',
    profile: {
      name: 'Ramesh Kumar',
      age: 42,
      gender: 'Male',
      occupation: 'Farmer',
      landHoldingHectares: 1.5,
      state: 'Uttar Pradesh',
      aadhaarNumber: '548291046329',
      verified: true,
      verifiedDocuments: ['Aadhaar Card', 'Land Record (RoR)', 'Bank Passbook'],
    },
  },
  {
    id: 'citizen-2',
    name: 'Sunita Devi',
    role: 'Artisan & Mother',
    profile: {
      name: 'Sunita Devi',
      age: 32,
      gender: 'Female',
      occupation: 'Self-Employed',
      annualIncome: 120000,
      state: 'Madhya Pradesh',
      digilockerId: 'DL-88319024',
      verified: true,
      verifiedDocuments: ['Aadhaar Card', 'DigiLocker eKYC', 'Caste Certificate'],
    },
  },
  {
    id: 'citizen-3',
    name: 'Ananya Das',
    role: 'Class 9 Student',
    profile: {
      name: 'Ananya Das',
      age: 15,
      gender: 'Female',
      occupation: 'Student',
      caste: 'SC',
      state: 'Bihar',
      verified: true,
      verifiedDocuments: ['Aadhaar Card', 'Student ID', 'Income Certificate'],
    },
  },
];

export function CscOperatorBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<QueuedCitizen[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_QUEUE;
    try {
      const saved = localStorage.getItem('schemesaathi_csc_queue');
      return saved ? JSON.parse(saved) : DEFAULT_QUEUE;
    } catch {
      return DEFAULT_QUEUE;
    }
  });

  const [activeCitizenId, setActiveCitizenId] = useState<string>('citizen-1');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    localStorage.setItem('schemesaathi_csc_queue', JSON.stringify(queue));
  }, [queue]);

  const handleSelectCitizen = (c: QueuedCitizen) => {
    setActiveCitizenId(c.id);
    saveStoredProfile(c.profile);
  };

  const handleCreateNewCitizen = () => {
    const nextNum = queue.length + 1;
    const newCitizen: QueuedCitizen = {
      id: `citizen-${Date.now()}`,
      name: `Applicant #${nextNum}`,
      role: 'New Registration',
      profile: {
        name: `Applicant #${nextNum}`,
      },
    };
    const updated = [...queue, newCitizen];
    setQueue(updated);
    setActiveCitizenId(newCitizen.id);
    saveStoredProfile(newCitizen.profile);
  };

  const handleWhatsAppShare = () => {
    const active = queue.find((c) => c.id === activeCitizenId) || queue[0];
    const text = `Namaste ${active.name}! Here is your SchemeSaathi Welfare Entitlement Summary:\n• Verified Status: Eligible\n• Reference Token: SS-2026-${Math.floor(1000 + Math.random() * 9000)}\n• Processed by CSC Kendra Operator (VLE-UP-88421).\nVisit nearest CSC Kendra with your Aadhaar card for biometric authentication.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-2 rounded-xl border-2 border-foreground bg-[#FFE5B4] text-foreground text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all flex items-center gap-2"
        title="Activate Common Service Centre (CSC) Operator Mode"
      >
        <Building2 className="w-4 h-4 text-amber-800" />
        <span>CSC Kiosk Mode</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-40 max-w-xl bg-card border-2 border-foreground rounded-2xl p-4 shadow-[6px_6px_0px_0px_var(--foreground)] animate-fade-in text-foreground">
      {/* Operator Header */}
      <div className="flex items-center justify-between border-b border-foreground/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-sm text-foreground">
                CSC Kendra VLE Workstation
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                VLE-UP-88421
              </span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground">
              Assisted-Tech Mode for Common Service Centre Operators
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Close CSC mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Applicant Queue Switcher */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Active Citizen Queue ({queue.length})
          </span>
          <button
            type="button"
            onClick={handleCreateNewCitizen}
            className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Citizen
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {queue.map((c) => {
            const isActive = c.id === activeCitizenId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCitizen(c)}
                className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all ${
                  isActive
                    ? 'border-foreground bg-primary/20 text-foreground font-black shadow-[2px_2px_0px_0px_var(--foreground)]'
                    : 'border-foreground/20 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40'
                }`}
              >
                <span className="text-xs font-bold block truncate max-w-[120px]">{c.name}</span>
                <span className="text-[9px] font-medium block opacity-75">{c.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operator Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-foreground/15">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex-1 py-2 px-3 rounded-xl border border-foreground/30 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          title="Send pre-formatted welfare summary to citizen's WhatsApp"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
          <span>{copiedShare ? 'Opening WhatsApp...' : 'Share on WhatsApp'}</span>
        </button>

        <button
          type="button"
          onClick={handlePrintReceipt}
          className="py-2 px-3 rounded-xl border border-foreground/30 bg-card hover:bg-muted text-foreground font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          title="Print official receipt for applicant"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip</span>
        </button>
      </div>
    </div>
  );
}
