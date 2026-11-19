'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, RotateCcw, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { UserProfile, saveStoredProfile, clearStoredProfile } from '@/lib/chat/profile';

interface DemoPersona {
  label: string;
  badge: string;
  profile: UserProfile;
  prompt: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    label: '🌾 Farmer (1.5 ha)',
    badge: 'PM-KISAN + PMFBY',
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
    prompt: 'I am Ramesh Kumar, a small farmer with 1.5 hectares in Uttar Pradesh. Evaluate my statutory welfare entitlements.',
  },
  {
    label: '🎓 Student (Class 9 SC)',
    badge: 'NMMSS + Post-Matric',
    profile: {
      name: 'Ananya Das',
      age: 15,
      gender: 'Female',
      occupation: 'Student',
      caste: 'SC',
      state: 'Bihar',
      aadhaarNumber: '882190341120',
      verified: true,
      verifiedDocuments: ['Aadhaar Card', 'Student ID', 'Income Certificate'],
    },
    prompt: 'I am Ananya Das, a Class 9 SC student in Bihar. Please verify my pre-qualified educational scholarships.',
  },
  {
    label: '👩 Artisan / Mother',
    badge: 'Vishwakarma + Ladli Behna',
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
    prompt: 'I am Sunita Devi, an artisan in Madhya Pradesh. Evaluate my entitlement for PM Vishwakarma and Ladli Behna Yojana.',
  },
];

export function DemoPresenterDock() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const handleApplyPersona = (persona: DemoPersona) => {
    setActivePreset(persona.label);
    saveStoredProfile(persona.profile);
    router.push(`/chat?prompt=${encodeURIComponent(persona.prompt)}`);
  };

  const handleReset = () => {
    clearStoredProfile();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saved_schemes');
      localStorage.removeItem('schemesaathi_profile');
    }
    setActivePreset(null);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
    router.push('/');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      
      {/* Expanded Persona Card Picker */}
      {isExpanded && (
        <div className="mb-2 p-3 bg-card border-2 border-foreground rounded-2xl shadow-[6px_6px_0px_0px_var(--foreground)] w-72 animate-fade-in text-foreground">
          <div className="flex items-center justify-between border-b border-foreground/15 pb-2 mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              1-Click Demo Personas
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] font-black text-rose-600 hover:underline flex items-center gap-1"
              title="Reset all demo state to clean slate"
            >
              {resetDone ? <Check className="w-3 h-3 text-emerald-600" /> : <RotateCcw className="w-3 h-3" />}
              <span>{resetDone ? 'Reset Clean!' : 'Reset Demo'}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {DEMO_PERSONAS.map((p) => {
              const isSelected = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPersona(p)}
                  className={`w-full p-2 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-primary/20 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]' 
                      : 'bg-background border-foreground/20 hover:border-foreground/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">{p.label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-foreground border border-foreground/20">
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium block truncate mt-0.5">
                    {p.profile.state} · Age {p.profile.age} · {p.profile.occupation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2 rounded-xl border-2 border-foreground bg-primary text-foreground text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
        title="Toggle 1-Click Live Stage Demo Dock"
      >
        <Sparkles className="w-3.5 h-3.5 text-foreground" />
        <span>Demo Dock</span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

    </div>
  );
}
