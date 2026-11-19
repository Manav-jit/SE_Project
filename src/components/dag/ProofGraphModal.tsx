'use client';

import React, { useState, useMemo } from 'react';
import { Scheme } from '@/lib/schemes/loader';
import { UserProfile } from '@/lib/chat/profile';
import { getSchemeDAG } from '@/lib/dag/rules';
import { evaluateSchemeDAG } from '@/lib/dag/evaluator';
import { TreeNodeCard } from './TreeNodeCard';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Sliders, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';

interface ProofGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  profile: UserProfile;
}

interface WhatIfProfile {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  income: number;
  landHoldingHectares: number;
  state: string;
  enrolledSchemes: string[];
  [key: string]: unknown;
}

export function ProofGraphModal({
  isOpen,
  onClose,
  scheme,
  profile,
}: ProofGraphModalProps) {
  const [overrides, setOverrides] = useState<Partial<WhatIfProfile>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const defaultProfile = useMemo<WhatIfProfile>(() => ({
    name: profile.name || 'Beneficiary',
    age: profile.age ?? 35,
    gender: profile.gender || 'male',
    occupation: profile.occupation || 'farmer',
    income: profile.income ?? 180000,
    landHoldingHectares: 1.5,
    state: profile.state || 'Punjab',
    enrolledSchemes: [],
  }), [profile]);

  const whatIfProfile = useMemo<WhatIfProfile>(() => ({
    ...defaultProfile,
    ...overrides,
  }), [defaultProfile, overrides]);

  const isModified = Object.keys(overrides).length > 0;

  // Retrieve the formal DAG definition for this scheme
  const dag = useMemo(() => {
    if (!scheme) return null;
    return getSchemeDAG(scheme.id);
  }, [scheme]);

  // Deterministically evaluate DAG against the current what-if profile
  const evaluation = useMemo(() => {
    if (!dag) return null;
    return evaluateSchemeDAG(dag, whatIfProfile as Record<string, unknown>);
  }, [dag, whatIfProfile]);

  if (!isOpen || !scheme) return null;

  const handleReset = () => {
    setOverrides({});
  };

  const updateField = (field: keyof WhatIfProfile, value: unknown) => {
    setOverrides((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: whatIfProfile, schemeId: scheme.id }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scheme.id}_formal_verification.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const verdictMeta = () => {
    if (!evaluation) return { label: 'CHECKING', bg: 'bg-muted', text: 'text-foreground' };
    switch (evaluation.verdict) {
      case 'ELIGIBLE':
        return {
          label: '100% ELIGIBLE & VERIFIED',
          bg: 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-[3px_3px_0px_0px_var(--foreground)]',
          icon: <CheckCircle2 className="w-5 h-5 text-slate-950" />,
        };
      case 'INELIGIBLE':
        return {
          label: 'STATUTORY CRITERIA UNMET',
          bg: 'bg-red-500 text-white border-red-700 shadow-[3px_3px_0px_0px_var(--foreground)]',
          icon: <XCircle className="w-5 h-5 text-white" />,
        };
      case 'CONDITIONAL_INCOMPLETE':
        return {
          label: 'DEMOGRAPHIC DATA REQUIRED',
          bg: 'bg-amber-400 text-slate-950 border-amber-600 shadow-[3px_3px_0px_0px_var(--foreground)]',
          icon: <HelpCircle className="w-5 h-5 text-slate-950" />,
        };
    }
  };

  const meta = verdictMeta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-md animate-fade-in p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[94vh] bg-background border-3 border-foreground rounded-2xl shadow-[8px_8px_0px_0px_var(--foreground)] overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-[#F9FFF4] border-b-2 border-foreground p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)] shrink-0">
              <ShieldCheck className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Formal Logic Verification Engine (DAG)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-500 text-[10px] font-black text-emerald-800">
                  Zero Hallucination Guaranteed
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-serif text-foreground truncate max-w-md sm:max-w-xl">
                {scheme.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg border-2 font-black text-xs flex items-center gap-1.5 ${meta.bg}`}>
              {meta.icon}
              <span>{meta.label}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border-2 border-foreground bg-card text-foreground hover:bg-red-100 transition-all shadow-[2px_2px_0px_0px_var(--foreground)]"
              title="Close Proof Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Evaluation Summary Strip */}
        {evaluation && (
          <div className="bg-card border-b-2 border-foreground px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground font-mono">
                STATUTORY EVALUATION METRICS:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 font-black">
                {evaluation.passedCount} Passed
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-400 font-black">
                {evaluation.failedCount} Violated
              </span>
              {evaluation.missingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-400 font-black">
                  {evaluation.missingCount} Missing
                </span>
              )}
              {evaluation.prunedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold">
                  {evaluation.prunedCount} Pruned
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-muted-foreground italic truncate max-w-md">
              {evaluation.summary}
            </p>
          </div>
        )}

        {/* Main Content Workspace (Split Layout) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: Visual Decision Tree / AST (62%) */}
          <div className="flex-1 lg:w-[62%] p-4 sm:p-6 overflow-y-auto space-y-4 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground bg-[#FDFEFA]">
            
            {/* Counterfactual Alert Card (if any rule failed) */}
            {evaluation && evaluation.counterfactuals.length > 0 && (
              <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 shadow-[3px_3px_0px_0px_#ef4444] space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-900">
                    Minimal Counterfactual Proof (Exact Failure Gaps)
                  </span>
                </div>
                {evaluation.counterfactuals.map((cf) => (
                  <div key={cf.failedNodeId} className="text-xs text-red-900 bg-white/80 p-2.5 rounded-lg border border-red-200">
                    <p className="font-bold">{cf.gapExplanation}</p>
                    <p className="text-[11px] text-red-700 mt-1">
                      <strong>Remedy:</strong> {cf.actionableStep}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tree Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Hierarchical AST Decision Graph
                </h3>
                <p className="text-xs text-muted-foreground">
                  Each node is evaluated deterministically against current facts
                </p>
              </div>

              {isModified && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-400 font-black text-[10px] animate-pulse">
                  ● What-If Simulation Active
                </span>
              )}
            </div>

            {/* Visual Tree Rendering */}
            {evaluation?.rootResult ? (
              <div className="p-4 bg-background border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_0px_var(--foreground)]">
                <TreeNodeCard result={evaluation.rootResult} />
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-muted-foreground">
                No formal rule tree compiled for this scheme.
              </div>
            )}

          </div>

          {/* Right Panel: Interactive "What-If" Parameter Simulator (38%) */}
          <div className="w-full lg:w-[38%] bg-card p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 shrink-0">
            
            <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h4 className="font-black text-sm uppercase tracking-wide text-foreground">
                  What-If Simulator
                </h4>
              </div>

              {isModified && (
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-md border-2 border-foreground bg-background text-foreground text-[10px] font-black hover:bg-muted flex items-center gap-1 shadow-[2px_2px_0px_0px_var(--foreground)]"
                  title="Reset to citizen's baseline profile"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
              Adjust parameters below to see how nodes transition dynamically between <strong>SATISFIED</strong> and <strong>VIOLATED</strong> in real time.
            </p>

            {/* Parameter Controls */}
            <div className="space-y-4">
              
              {/* Age Slider */}
              <div className="space-y-1.5 p-3 rounded-xl border-2 border-foreground/15 bg-background">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-black text-foreground">Age</label>
                  <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/20 rounded">
                    {whatIfProfile.age ?? 35} years
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={90}
                  value={whatIfProfile.age ?? 35}
                  onChange={(e) => updateField('age', parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 yr</span>
                  <span>18 yrs</span>
                  <span>60 yrs</span>
                  <span>90 yrs</span>
                </div>
              </div>

              {/* Annual Income Slider */}
              <div className="space-y-1.5 p-3 rounded-xl border-2 border-foreground/15 bg-background">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-black text-foreground">Annual Family Income</label>
                  <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/20 rounded">
                    ₹{(whatIfProfile.income ?? 180000).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2500000}
                  step={25000}
                  value={whatIfProfile.income ?? 180000}
                  onChange={(e) => updateField('income', parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>₹0</span>
                  <span>₹2.5L</span>
                  <span>₹8L</span>
                  <span>₹25L</span>
                </div>
              </div>

              {/* Occupation Selector */}
              <div className="space-y-1.5 p-3 rounded-xl border-2 border-foreground/15 bg-background">
                <label className="block text-xs font-black text-foreground">
                  Primary Occupation
                </label>
                <select
                  value={whatIfProfile.occupation || 'farmer'}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-foreground rounded-lg bg-card focus:outline-none"
                >
                  <option value="farmer">Farmer / Cultivator</option>
                  <option value="student">Student</option>
                  <option value="self-employed">Self-Employed / Entrepreneur</option>
                  <option value="laborer">Daily Wage Laborer</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1.5 p-3 rounded-xl border-2 border-foreground/15 bg-background">
                <label className="block text-xs font-black text-foreground">
                  Beneficiary Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={`py-1.5 rounded-lg border-2 text-xs font-black capitalize transition-all ${
                        whatIfProfile.gender === g
                          ? 'bg-primary text-foreground border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]'
                          : 'bg-card text-muted-foreground border-foreground/20 hover:text-foreground'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Holding (Hectares) Slider */}
              <div className="space-y-1.5 p-3 rounded-xl border-2 border-foreground/15 bg-background">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-black text-foreground">Cultivable Land</label>
                  <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/20 rounded">
                    {whatIfProfile.landHoldingHectares ?? 1.5} hectares
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={8.0}
                  step={0.1}
                  value={whatIfProfile.landHoldingHectares ?? 1.5}
                  onChange={(e) => updateField('landHoldingHectares', parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0.1 ha</span>
                  <span>2.0 ha (Cap)</span>
                  <span>5.0 ha</span>
                  <span>8.0 ha</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-3 flex flex-col gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-foreground bg-primary text-foreground font-black text-xs hover:bg-[#8ecb5a] transition-all flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_var(--foreground)] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Generating...' : 'Export Formal Proof Certificate (PDF)'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-foreground bg-background text-foreground font-black text-xs hover:bg-muted transition-all shadow-[2px_2px_0px_0px_var(--foreground)]"
              >
                Close Inspector
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

