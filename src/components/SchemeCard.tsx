import { Scheme } from '@/lib/schemes/loader';
import { FileText, Building2, Bookmark, BookmarkCheck, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';
import { useState } from 'react';
import { getSchemeBenefitMeta } from '@/lib/schemes/benefits';

interface SchemeCardProps {
  scheme: Scheme;
  profile?: UserProfile;
  onGenerateForm: (schemeId: string) => void;
  onViewDetails: (schemeId: string) => void;
  onVerifyProof?: (schemeId: string) => void;
  onAutoFile?: (schemeId: string) => void;
}

export function SchemeCard({ scheme, profile = {}, onGenerateForm, onViewDetails, onVerifyProof, onAutoFile }: SchemeCardProps) {
  const meta = getSchemeBenefitMeta(scheme.id);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
      return saved.includes(scheme.id);
    } catch {
      return false;
    }
  });
  const handleProof = onVerifyProof || onAutoFile;

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
    if (isSaved) {
      const newSaved = saved.filter((id: string) => id !== scheme.id);
      localStorage.setItem('saved_schemes', JSON.stringify(newSaved));
      setIsSaved(false);
    } else {
      saved.push(scheme.id);
      localStorage.setItem('saved_schemes', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  // Eligibility calculation based on profile data
  const totalReq = scheme.documents_required?.length || 3;
  let metReq = 0;
  if (profile.name) metReq++;
  if (profile.verified) metReq++;
  if (profile.state) metReq++;
  metReq = Math.min(metReq, totalReq);
  const progressPercent = Math.round((metReq / totalReq) * 100);

  return (
    <div className="organic-card p-5 flex flex-col gap-4 animate-fade-in transition-all relative">
      <button 
        onClick={toggleSave}
        className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground z-10"
        title={isSaved ? "Remove from saved" : "Save scheme"}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
      </button>

      <div className="pr-8">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 border border-foreground/30 text-[10px] font-black text-foreground uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-primary" /> {meta.formattedValue}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground truncate">
            {meta.typeLabel}
          </span>
        </div>
        <h3 className="font-black font-serif text-xl text-foreground line-clamp-2">{scheme.name}</h3>
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mt-1.5">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{scheme.ministry}</span>
        </div>
      </div>
      
      <div className="text-sm font-medium text-foreground/80 line-clamp-2">
        {scheme.benefits}
      </div>

      {/* Statutory Citation Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF6E9] border border-foreground/20 text-[10px] font-bold text-foreground/75">
        <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span className="truncate font-mono">{meta.citation}</span>
      </div>

      {/* Eligibility Tracker */}
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-xs font-bold text-foreground">
          <span>Application Readiness</span>
          <span className="text-foreground">{metReq}/{totalReq} Verified</span>
        </div>
        <div className="h-2 w-full bg-background border-2 border-foreground rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out border-r-2 border-foreground" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="pt-2 mt-auto flex flex-col gap-2">
        {handleProof && (
          <button
            onClick={() => handleProof(scheme.id)}
            className="w-full py-2.5 rounded-full border-2 border-foreground bg-primary text-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-foreground" />
            🔍 Verify Proof Graph (DAG)
          </button>
        )}
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(scheme.id)}
            className="w-1/2 py-2 rounded-full border-2 border-foreground bg-card text-foreground font-black uppercase tracking-wider text-xs hover:shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all"
          >
            Details
          </button>
          <button 
            onClick={() => onGenerateForm(scheme.id)}
            className="w-1/2 py-2 organic-button text-xs flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Get PDF
          </button>
        </div>
      </div>
    </div>
  );
}
