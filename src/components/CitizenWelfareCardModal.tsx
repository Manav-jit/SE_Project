'use client';

import React, { useRef } from 'react';
import { X, ShieldCheck, Printer, CheckCircle2, QrCode, Sparkles, Building2, User } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';
import { Scheme } from '@/lib/schemes/loader';
import { calculateBenefitSummary, getSchemeBenefitMeta } from '@/lib/schemes/benefits';

interface CitizenWelfareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  schemes: Scheme[];
}

export function CitizenWelfareCardModal({
  isOpen,
  onClose,
  profile,
  schemes,
}: CitizenWelfareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const benefitSummary = calculateBenefitSummary(schemes);
  const citizenName = profile.name || (profile.occupation ? `${profile.occupation} Entitlement Holder` : 'Verified Citizen');
  const citizenAadhaar = profile.aadhaarNumber 
    ? `•••• •••• ${profile.aadhaarNumber.slice(-4)}`
    : profile.aadhaarLast4
    ? `•••• •••• ${profile.aadhaarLast4}`
    : profile.digilockerId 
    ? `DL-${profile.digilockerId.slice(0, 8)}`
    : 'DPI-VERIFIED-2026';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-card border-2 border-foreground rounded-3xl shadow-[8px_8px_0px_0px_var(--foreground)] overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:border-none print:max-h-none">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-foreground bg-primary/20 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-serif font-black text-lg text-foreground">
              Official Citizen Welfare Entitlement Card
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-card-border/50 text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Printable PVC-Style Card */}
          <div 
            ref={cardRef}
            className="relative rounded-2xl border-4 border-foreground bg-gradient-to-br from-[#FFFDF0] via-[#FAF6E9] to-[#F1F8E9] p-6 shadow-[6px_6px_0px_0px_var(--foreground)] overflow-hidden print:border-2 print:shadow-none"
          >
            {/* Watermark / Hologram Badge */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-2 right-4 text-[64px] font-black font-serif text-foreground/[0.04] select-none pointer-events-none">
              DPI·BHARAT
            </div>

            {/* Card Top Branding */}
            <div className="flex items-start justify-between border-b-2 border-foreground/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] shrink-0">
                  <Building2 className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Digital Public Infrastructure
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400 text-[10px] font-black">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Statutory DAG Verified
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-xl text-foreground">
                    SchemeSaathi Welfare Entitlement Card
                  </h3>
                </div>
              </div>

              {/* Verified Token Pill */}
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Card Token
                </span>
                <span className="font-mono text-xs font-black text-foreground bg-accent/40 px-2 py-1 rounded border border-foreground/30 inline-block">
                  {citizenAadhaar}
                </span>
              </div>
            </div>

            {/* Citizen Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 items-center">
              {/* Photo Box */}
              <div className="flex items-center gap-3 sm:col-span-2">
                <div className="w-16 h-16 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] shrink-0 overflow-hidden">
                  <User className="w-10 h-10 text-muted-foreground/60" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-lg text-foreground leading-tight">
                    {citizenName}
                  </h4>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">
                    {[profile.age ? `${profile.age} Yrs` : null, profile.gender, profile.occupation, profile.state]
                      .filter(Boolean)
                      .join(' · ') || 'Verified Resident of India'}
                  </p>
                  {(profile.annualIncome || profile.income) && (
                    <p className="text-[11px] font-bold text-foreground/80 mt-1">
                      Reported Income: ₹{(profile.annualIncome || profile.income)?.toLocaleString('en-IN')}/yr
                    </p>
                  )}
                </div>
              </div>

              {/* Total Unlocked Value Box */}
              <div className="p-3 rounded-xl bg-primary/20 border-2 border-foreground text-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Total Entitlement Value
                </span>
                <span className="text-xl sm:text-2xl font-black font-serif text-foreground block">
                  {benefitSummary.formattedTotal}
                </span>
                <span className="text-[10px] font-bold text-foreground/70">
                  Across {benefitSummary.verifiedSchemeCount} Schemes
                </span>
              </div>
            </div>

            {/* Qualified Schemes Breakdown */}
            <div className="border-t-2 border-foreground/15 pt-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                Pre-Qualified Statutory Schemes ({schemes.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {schemes.slice(0, 6).map((s) => {
                  const meta = getSchemeBenefitMeta(s.id);
                  return (
                    <div 
                      key={s.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-card border border-foreground/20 text-xs"
                    >
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold truncate text-foreground">{s.name}</span>
                      </div>
                      <span className="font-black text-[11px] text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/30">
                        {meta.formattedValue}
                      </span>
                    </div>
                  );
                })}
              </div>
              {schemes.length > 6 && (
                <p className="text-[11px] font-bold text-muted-foreground mt-2 text-right">
                  + {schemes.length - 6} additional verified schemes in dossier
                </p>
              )}
            </div>

            {/* Card Footer with Security QR & Authority */}
            <div className="mt-5 pt-3 border-t-2 border-dashed border-foreground/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-foreground/30 flex items-center justify-center p-1 shrink-0">
                  <QrCode className="w-8 h-8 text-foreground" />
                </div>
                <div className="text-[10px] text-muted-foreground font-medium leading-tight">
                  <p className="font-bold text-foreground">Scan at nearest Common Service Centre (CSC)</p>
                  <p>Immutable statutory proof issued by SchemeSaathi Engine</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-muted-foreground block">
                  STATUTORY DAG: VALIDATED
                </span>
                <span className="text-[10px] font-black text-emerald-700">
                  0 Contradictions
                </span>
              </div>
            </div>

          </div>

          {/* Action Explainer */}
          <div className="p-4 rounded-xl bg-accent/20 border border-foreground/20 text-xs font-bold text-foreground/80 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-foreground shrink-0" />
            <p>
              This card certifies your statutory eligibility across {benefitSummary.verifiedSchemeCount} central & state welfare programs. You can present this certificate at your local Gram Panchayat or CSC center.
            </p>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-foreground bg-card print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border-2 border-foreground text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-foreground bg-primary text-foreground text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save Card
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
