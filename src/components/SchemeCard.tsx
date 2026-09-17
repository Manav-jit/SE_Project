import { Scheme } from '@/lib/schemes/loader';
import { FileText, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';
import { useState, useEffect } from 'react';

interface SchemeCardProps {
  scheme: Scheme;
  profile?: UserProfile;
  onGenerateForm: (schemeId: string) => void;
  onViewDetails: (schemeId: string) => void;
}

export function SchemeCard({ scheme, profile = {}, onGenerateForm, onViewDetails }: SchemeCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
    if (saved.includes(scheme.id)) {
      setIsSaved(true);
    }
  }, [scheme.id]);

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

  // Mock eligibility calculation based on profile data
  const totalReq = scheme.documents_required?.length || 3;
  let metReq = 0;
  if (profile.name) metReq++;
  if (profile.verified) metReq++;
  if (profile.state) metReq++;
  metReq = Math.min(metReq, totalReq);
  const progressPercent = Math.round((metReq / totalReq) * 100);

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 animate-fade-in transition-all hover:border-primary/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] relative">
      <button 
        onClick={toggleSave}
        className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-card-border transition-colors text-muted-foreground hover:text-primary z-10"
        title={isSaved ? "Remove from saved" : "Save scheme"}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
      </button>

      <div className="pr-8">
        <h3 className="font-semibold text-lg text-foreground line-clamp-2">{scheme.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">{scheme.ministry}</span>
        </div>
      </div>
      
      <div className="text-sm text-foreground/80 line-clamp-3">
        {scheme.benefits}
      </div>

      {/* Eligibility Tracker */}
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Eligibility Readiness</span>
          <span className="text-primary font-medium">{metReq}/{totalReq} Docs</span>
        </div>
        <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="pt-2 mt-auto flex gap-2">
        <button 
          onClick={() => onViewDetails(scheme.id)}
          className="w-1/2 py-2.5 rounded-lg bg-secondary/30 text-secondary-foreground font-medium hover:bg-secondary transition-colors text-sm"
        >
          View Details
        </button>
        <button 
          onClick={() => onGenerateForm(scheme.id)}
          className="w-1/2 py-2.5 rounded-lg bg-accent/10 text-accent font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <FileText className="w-4 h-4" />
          Get Form
        </button>
      </div>
    </div>
  );
}
