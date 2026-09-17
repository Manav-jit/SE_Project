'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, User, Briefcase, MapPin, ShieldCheck, Loader2, Check } from 'lucide-react';
import { DigiLockerModal } from '@/components/DigiLockerModal';
import { UserProfile } from '@/lib/chat/profile';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const occupations = [
  "Farmer", "Laborer", "Government Employee", "Private Sector", "Self-Employed",
  "Student", "Homemaker", "Retired", "Unemployed", "Other"
];

const genderOptions = ["Male", "Female", "Other"];

type WizardStep = 0 | 1 | 2;

export default function WizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDigiLockerMode = searchParams.get('mode') === 'digilocker';

  const [step, setStep] = useState<WizardStep>(0);
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const [profile, setProfile] = useState<UserProfile>({});

  // Auto-open DigiLocker if mode=digilocker
  useEffect(() => {
    if (isDigiLockerMode) {
      setIsDigiLockerOpen(true);
    }
  }, [isDigiLockerMode]);

  const handleDigiLockerVerify = (verifiedData: Partial<UserProfile>) => {
    const merged = { ...profile, ...verifiedData };
    setProfile(merged);
    // Go directly to results
    navigateToResults(merged);
  };

  const navigateToResults = (p: UserProfile) => {
    setIsSubmitting(true);
    const profileParam = encodeURIComponent(JSON.stringify(p));
    setTimeout(() => {
      router.push(`/matches?profile=${profileParam}`);
    }, 600);
  };

  const goNext = () => {
    if (step < 2) {
      setDirection('forward');
      setStep((s) => (s + 1) as WizardStep);
    } else {
      navigateToResults(profile);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection('backward');
      setStep((s) => (s - 1) as WizardStep);
    }
  };

  const updateProfile = (key: string, value: string | number) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const stepLabels = ["About You", "Occupation & Income", "Your State"];
  const stepIcons = [User, Briefcase, MapPin];

  const isStepValid = () => {
    if (step === 0) return profile.age && profile.gender;
    if (step === 1) return profile.occupation;
    if (step === 2) return profile.state;
    return false;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#22c55e]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <DigiLockerModal 
        isOpen={isDigiLockerOpen} 
        onClose={() => { setIsDigiLockerOpen(false); if (isDigiLockerMode) router.push('/'); }}
        onVerify={handleDigiLockerVerify} 
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-foreground">Quick-Match Wizard</h1>
          <p className="text-muted-foreground font-bold text-sm mt-2">3 quick steps to find your eligible schemes.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3} aria-label="Wizard progress">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-1 rounded-full transition-all duration-500 ${isComplete ? 'bg-[#22c55e]' : isActive ? 'bg-primary' : 'bg-card-border'}`} />
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isComplete ? 'bg-[#22c55e]/20' : isActive ? 'bg-primary/20' : 'bg-card-border/50'}`}>
                    {isComplete ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Icon className={`w-3 h-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                  </div>
                  <span className={`text-xs hidden sm:inline ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="organic-card p-6 sm:p-8 min-h-[360px] flex flex-col bg-[#F9FFF4]">
          {isSubmitting ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-foreground font-medium">Finding your schemes...</p>
              <p className="text-sm text-muted-foreground">Matching against government databases</p>
            </div>
          ) : (
            <div key={step} className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}>

              {/* Step 0: Basic Info */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Tell us about yourself</h2>
                    <p className="text-sm text-muted-foreground">Basic details to narrow down eligible schemes.</p>
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Age</legend>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="Enter your age"
                      value={profile.age || ''}
                      onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                      className="w-full bg-background border-2 border-foreground rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                      aria-label="Age"
                    />
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Gender</legend>
                    <div className="flex gap-2">
                      {genderOptions.map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateProfile('gender', g.toLowerCase())}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${profile.gender === g.toLowerCase() ? 'border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] translate-y-[-2px]' : 'border-foreground/30 text-foreground hover:border-foreground hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px]'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Step 1: Occupation */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">What do you do?</h2>
                    <p className="text-sm text-muted-foreground">Your occupation helps us find sector-specific schemes.</p>
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Occupation</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {occupations.map(occ => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => updateProfile('occupation', occ.toLowerCase())}
                          className={`px-3 py-3 rounded-xl text-sm text-left border-2 transition-all ${profile.occupation === occ.toLowerCase() ? 'border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] translate-y-[-2px] font-black' : 'border-foreground/30 text-foreground font-bold hover:border-foreground hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px]'}`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Annual Income (Optional)</legend>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 250000"
                      value={profile.income || ''}
                      onChange={(e) => updateProfile('income', parseInt(e.target.value) || 0)}
                      className="w-full bg-background border-2 border-foreground rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--primary)] transition-all"
                      aria-label="Annual income in rupees"
                    />
                  </fieldset>
                </div>
              )}

              {/* Step 2: State */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Where are you from?</h2>
                    <p className="text-sm text-muted-foreground">Many schemes are state-specific.</p>
                  </div>

                  <fieldset>
                    <legend className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">State</legend>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {indianStates.map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateProfile('state', st)}
                          className={`px-3 py-2 rounded-xl text-sm text-left border-2 transition-all ${profile.state === st ? 'border-foreground bg-primary text-foreground shadow-[4px_4px_0px_0px_var(--foreground)] translate-y-[-2px] font-black' : 'border-foreground/30 text-foreground font-bold hover:border-foreground hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px]'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}

          {/* Navigation */}
          {!isSubmitting && (
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-card-border">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-3">
                {step === 0 && !isDigiLockerMode && (
                  <button
                    type="button"
                    onClick={() => setIsDigiLockerOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 border-foreground bg-[#FFE5B4] text-foreground text-sm font-black uppercase tracking-wider hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" /> Use DigiLocker
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isStepValid()}
                  className="flex items-center gap-1.5 px-6 py-2.5 organic-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_var(--foreground)] text-sm"
                >
                  {step === 2 ? 'Find Schemes' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
