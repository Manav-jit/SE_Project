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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-foreground">DigiLocker Verification</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'login' && (
            <form onSubmit={handleConnect} className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to your DigiLocker account to instantly verify your identity and auto-fill your profile.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Aadhaar/Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="Enter 12 digit Aadhaar or Mobile" 
                  defaultValue="9876543210"
                  required
                  className="w-full bg-background border border-card-border rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">6 Digit Security PIN</label>
                <input 
                  type="password" 
                  placeholder="******" 
                  defaultValue="123456"
                  required
                  className="w-full bg-background border border-card-border rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium rounded-lg p-2.5 mt-4 transition-colors flex items-center justify-center gap-2"
              >
                Sign In
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Mock integration. No real data is sent.
              </p>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-foreground font-medium">Authenticating with DigiLocker...</p>
              <p className="text-xs text-muted-foreground">Please wait while we securely fetch your data.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-base text-foreground font-medium">Verification Successful!</p>
              <p className="text-sm text-muted-foreground text-center">Your profile has been securely updated with verified documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
