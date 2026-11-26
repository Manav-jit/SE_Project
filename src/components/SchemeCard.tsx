'use client';

import { Scheme } from '@/lib/schemes/loader';
import { 
  FileText, Building2, Bookmark, BookmarkCheck, ShieldCheck, Scale, Sparkles, 
  ChevronDown, ChevronUp, CheckCircle2, Circle
} from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Eligibility readiness calculation
  const totalReq = scheme.documents_required?.length || 3;
  let metReq = 0;
  if (profile.name) metReq++;
  if (profile.verified || profile.digilockerId || profile.aadhaarNumber || profile.aadhaarLast4) metReq++;
  if (profile.state) metReq++;
  metReq = Math.min(metReq, totalReq);
  const progressPercent = Math.round((metReq / totalReq) * 100);

  // Circular progress math (r=18, C ~ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="organic-card p-5 flex flex-col gap-3.5 animate-fade-in transition-all relative">
      
      {/* Save Bookmark Button */}
      <button 
        type="button"
        onClick={toggleSave}
        className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground z-10"
        title={isSaved ? "Remove from saved" : "Save scheme"}
        aria-label={isSaved ? `Remove ${scheme.name} from saved` : `Save ${scheme.name}`}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
      </button>

      {/* Top Value Banner */}
      <div className="pr-8">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 border border-foreground/30 text-[11px] font-black text-foreground uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {meta.formattedValue}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground truncate">
            {meta.typeLabel}
          </span>
        </div>
        
        <h3 className="font-black font-serif text-xl text-foreground line-clamp-2 leading-tight">
          {scheme.name}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mt-1.5">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{scheme.ministry}</span>
        </div>
      </div>
      
      <p className="text-xs font-bold text-foreground/85 line-clamp-2 leading-relaxed">
        {scheme.benefits}
      </p>

      {/* Circular Readiness Gauge Card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-foreground/15">
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-foreground/15 stroke-current"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-primary stroke-current transition-all duration-700 ease-out"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[11px] font-black font-serif text-foreground">
            {progressPercent}%
          </span>
        </div>
        
        <div className="text-xs">
          <span className="font-black text-foreground block">
            {progressPercent === 100 ? 'Ready for Immediate Submission' : 'Application Dossier Readiness'}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground">
            {metReq} of {totalReq} verified statutory requirements
          </span>
        </div>
      </div>

      {/* Progressive Disclosure Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground py-1 border-t border-foreground/10 transition-colors"
      >
        <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-black">
          <Scale className="w-3.5 h-3.5 text-amber-700" />
          {isExpanded ? 'Hide Statutory Order & Documents' : 'View Statutory Order & Documents'}
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-fade-in text-xs">
          {/* Statutory Citation Box */}
          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-300 text-[11px] font-bold text-amber-950 flex items-start gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-mono text-muted-foreground block uppercase">Official Legal Authority</span>
              <span className="font-mono">{meta.citation}</span>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">
              Required Documents:
            </span>
            <div className="space-y-1">
              {scheme.documents_required.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-foreground font-bold">
                  {idx < metReq ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 mt-auto flex flex-col gap-2">
        {/* Dominant Primary Action */}
        <button 
          type="button"
          onClick={() => onGenerateForm(scheme.id)}
          className="w-full py-2.5 organic-button text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_var(--foreground)]"
        >
          <FileText className="w-4 h-4" />
          <span>Get Pre-filled Application Form</span>
        </button>

        {/* Secondary Action Row */}
        <div className="flex gap-2">
          {handleProof && (
            <button
              type="button"
              onClick={() => handleProof(scheme.id)}
              className="flex-1 py-1.5 rounded-xl border border-foreground/30 bg-card hover:bg-primary/20 text-foreground font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Verify DAG</span>
            </button>
          )}
          <button 
            type="button"
            onClick={() => onViewDetails(scheme.id)}
            className="flex-1 py-1.5 rounded-xl border border-foreground/30 bg-card hover:bg-muted text-foreground font-black text-[11px] uppercase tracking-wider transition-all"
          >
            Details
          </button>
        </div>
      </div>

    </div>
  );
}
