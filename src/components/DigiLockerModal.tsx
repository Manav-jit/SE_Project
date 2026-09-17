import { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: Partial<UserProfile>) => void;
}

export function DigiLockerModal({ isOpen, onClose, onVerify }: DigiLockerModalProps) {
  const [step, setStep] = useState<'login' | 'loading' | 'success'>('login');
  
  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    
    // Simulate network delay for OAuth
    setTimeout(() => {
      setStep('success');
      
      // Inject mock verified data
      setTimeout(() => {
        onVerify({
          name: "Rahul Kumar",
          age: 45, // roughly born in 1979
          gender: "Male",
          state: "Uttar Pradesh",
          verified: true
        });
        setStep('login'); // reset for future
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md organic-card overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-[#F9FFF4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-foreground" />
            <span className="font-black font-serif text-xl text-foreground">DigiLocker Verification</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-card">
          {step === 'login' && (
            <form onSubmit={handleConnect} className="space-y-4 animate-fade-in">
              <p className="text-sm font-bold text-muted-foreground mb-6">
                Sign in to your DigiLocker account to instantly verify your identity and auto-fill your profile.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-foreground">Aadhaar/Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="Enter 12 digit Aadhaar or Mobile" 
                  defaultValue="9876543210"
                  required
                  className="w-full bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] rounded-lg p-3 text-sm font-bold outline-none focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_0px_var(--foreground)] transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-foreground">6 Digit Security PIN</label>
                <input 
                  type="password" 
                  placeholder="******" 
                  defaultValue="123456"
                  required
                  className="w-full bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] rounded-lg p-3 text-sm font-bold outline-none focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_0px_var(--foreground)] transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full organic-button mt-6 py-3 flex items-center justify-center gap-2"
              >
                Sign In
              </button>
              
              <p className="text-xs text-center font-bold text-muted-foreground mt-4">
                Mock integration. No real data is sent.
              </p>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
              <Loader2 className="w-10 h-10 text-foreground animate-spin" />
              <p className="text-lg font-black font-serif text-foreground">Authenticating with DigiLocker...</p>
              <p className="text-sm font-bold text-muted-foreground">Please wait while we securely fetch your data.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-foreground bg-[#F9FFF4] shadow-[4px_4px_0px_0px_var(--foreground)] flex items-center justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-foreground" />
              </div>
              <p className="text-2xl font-black font-serif text-foreground">Verification Successful!</p>
              <p className="text-sm font-bold text-muted-foreground text-center max-w-[250px]">Your profile has been securely updated with verified documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
