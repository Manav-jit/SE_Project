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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Action Plan</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2">{scheme.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">Follow these steps to apply for this scheme.</p>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl shadow-sm">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">Step 1: Get Pre-filled Form</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Download the auto-generated application form filled with your details.
                  </span>
                  
                  {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="mt-3 w-full py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Download Form"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-bold text-muted-foreground text-sm">2</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl shadow-sm opacity-90">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">Step 2: Attach Documents</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Print the form and attach copies of your Aadhaar card and bank passbook.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-bold text-muted-foreground text-sm">3</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl shadow-sm opacity-90">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">Step 3: Submit Application</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Submit the signed form to your nearest Common Service Centre (CSC) or relevant government office.
                  </span>
                  <a 
                    href="https://www.google.com/maps/search/Common+Service+Centre+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
