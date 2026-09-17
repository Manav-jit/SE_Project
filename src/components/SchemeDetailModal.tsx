import { X, Info, FileCheck, Landmark } from 'lucide-react';
import { Scheme } from '@/lib/schemes/loader';

interface SchemeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
}

export function SchemeDetailModal({ isOpen, onClose, scheme }: SchemeDetailModalProps) {
  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">{scheme.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
              <Landmark className="w-4 h-4 text-primary" />
              <span>{scheme.ministry}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              Benefits
            </h3>
            <p className="text-foreground leading-relaxed bg-accent/5 p-4 rounded-xl border border-accent/10">
              {scheme.benefits}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Eligibility
              </h3>
              <ul className="space-y-2">
                {((scheme.eligibility as unknown as string[]) || []).map((criterion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-green-500" />
                Required Documents
              </h3>
              <ul className="space-y-2">
                {((scheme.documents_required as unknown as string[]) || []).map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-card-border bg-background flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
