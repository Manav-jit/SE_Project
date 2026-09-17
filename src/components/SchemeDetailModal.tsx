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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-2xl organic-card overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-[#F9FFF4]">
          <div>
            <h2 className="text-2xl font-black font-serif text-foreground">{scheme.name}</h2>
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground/80 mt-2">
              <Landmark className="w-4 h-4" />
              <span>{scheme.ministry}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground self-start shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              Benefits
            </h3>
            <p className="text-foreground leading-relaxed bg-[#F9FFF4] p-4 rounded-xl border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] font-medium text-sm">
              {scheme.benefits}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Eligibility
              </h3>
              <ul className="space-y-2">
                {Object.entries(scheme.eligibility || {}).map(([key, value], i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 font-medium">
                    <span className="text-foreground mt-0.5 font-black">•</span>
                    <span>
                      <strong className="capitalize text-foreground">{key.replace(/_/g, ' ')}:</strong> {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Required Documents
              </h3>
              <ul className="space-y-2">
                {((scheme.documents_required as unknown as string[]) || []).map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <div className="w-2 h-2 rounded-full border border-foreground bg-primary shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-foreground bg-[#F9FFF4] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 organic-button text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
