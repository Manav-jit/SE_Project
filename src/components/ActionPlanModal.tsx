import { useState } from 'react';
import { X, FileText, CheckCircle, Download, Loader2, MapPin } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';
import { Scheme } from '@/lib/schemes/loader';

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  profile: UserProfile;
}

export function ActionPlanModal({ isOpen, onClose, scheme, profile }: ActionPlanModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !scheme) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, schemeId: scheme.id })
      });

      if (!res.ok) throw new Error("Failed to generate form");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scheme.id}_application.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md organic-card overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-[#F9FFF4]">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-foreground" />
            <span className="font-black font-serif text-xl text-foreground">Action Plan</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-card">
          <h2 className="text-2xl font-black font-serif mb-2">{scheme.name}</h2>
          <p className="text-sm font-bold text-muted-foreground mb-6">Follow these steps to apply for this scheme.</p>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-foreground">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_0px_var(--foreground)] z-10">
                <CheckCircle className="w-6 h-6 text-foreground" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#F9FFF4] border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-black text-sm text-foreground uppercase tracking-wide">Step 1: Get Pre-filled Form</span>
                  <span className="text-xs font-bold text-foreground/80 mt-1">
                    Download the auto-generated application form filled with your details.
                  </span>
                  
                  {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="mt-4 w-full py-2 organic-button text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Download Form"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_0px_var(--foreground)] z-10">
                <span className="font-black text-foreground text-sm">2</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-black text-sm text-foreground uppercase tracking-wide">Step 2: Attach Documents</span>
                  <span className="text-xs font-bold text-foreground/80 mt-1">
                    Print the form and attach copies of your Aadhaar card and bank passbook.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_0px_var(--foreground)] z-10">
                <span className="font-black text-foreground text-sm">3</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-black text-sm text-foreground uppercase tracking-wide">Step 3: Submit Application</span>
                  <span className="text-xs font-bold text-foreground/80 mt-1">
                    Submit the signed form to your nearest Common Service Centre (CSC) or relevant government office.
                  </span>
                  <a 
                    href="https://www.google.com/maps/search/Common+Service+Centre+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2 rounded-full border-2 border-foreground bg-accent text-foreground font-black uppercase tracking-wider text-xs hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Find nearby CSC
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
