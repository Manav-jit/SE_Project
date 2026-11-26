'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ShieldCheck, Globe, Volume2, VolumeX, X, 
  Sparkles, Award, FileText, CheckCircle2, Building2,
  Scan, UserCheck, Check
} from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SchemeCard } from '@/components/SchemeCard';
import { DigiLockerModal } from '@/components/DigiLockerModal';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { ProofGraphModal } from '@/components/dag/ProofGraphModal';
import { DocumentScannerModal } from '@/components/DocumentScannerModal';
import { CitizenWelfareCardModal } from '@/components/CitizenWelfareCardModal';
import { UserProfile, getStoredProfile, saveStoredProfile, PROFILE_EVENT } from '@/lib/chat/profile';
import { Scheme } from '@/lib/schemes/loader';
import { calculateBenefitSummary } from '@/lib/schemes/benefits';
import { inspectProfileDbtScrutiny } from '@/lib/ocr/scrutiny';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const QUICK_PROMPT_CHIPS = [
  { label: '🌾 Small Farmer (1.5 ha)', text: 'I am a small farmer with 1.5 hectares of land in Uttar Pradesh.' },
  { label: '🎓 Student Scholarship', text: 'I am a class 9 student looking for government scholarships.' },
  { label: '👩‍👧 Women & Mother Support', text: 'I am a married woman looking for maternity and women welfare schemes.' },
  { label: '💼 Artisan / Street Vendor', text: 'I am a traditional artisan and street vendor needing working capital credit.' },
];

function ChatContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  const hasSentInitialPrompt = useRef(false);

  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  // Modals state
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState<Scheme | null>(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<Scheme | null>(null);
  const [selectedSchemeForProof, setSelectedSchemeForProof] = useState<Scheme | null>(null);
  
  // View states
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [mobileTab, setMobileTab] = useState<'dossier' | 'copilot'>('copilot');
  const [hasSkippedStateSelection, setHasSkippedStateSelection] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!getStoredProfile().state;
  });

  const lastSpokenMessageRef = useRef<string>('');

  // Listen for storage updates
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      const updated = customEvent.detail || getStoredProfile();
      if (updated) setProfile(updated);
    };

    window.addEventListener(PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener(PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const updateAndSaveProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile(prev => {
      const next = updater(prev);
      saveStoredProfile(next);
      return next;
    });
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          profile: getStoredProfile(),
          language: (typeof window !== 'undefined' ? localStorage.getItem('schemesaathi_lang') : null) || 'en',
        }),
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          const updatedProfileStr = response.headers.get('x-updated-profile');
          if (updatedProfileStr) {
            try {
              const updated = JSON.parse(updatedProfileStr);
              setProfile(prev => {
                const merged = { ...prev, ...updated };
                saveStoredProfile(merged);
                return merged;
              });
            } catch (err) {
              console.error('Failed to parse updated profile', err);
            }
          }

          const matchedSchemesStr = response.headers.get('x-matched-schemes');
          if (matchedSchemesStr) {
            try {
              setMatchedSchemes(JSON.parse(decodeURIComponent(matchedSchemesStr)));
            } catch (err) {
              console.error('Failed to parse matched schemes', err);
            }
          }

          return response;
        },
      }),
    []
  );

  const { messages, sendMessage, status, clearError } = useChat<UIMessage>({
    transport,
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: "Namaste! I am your SchemeSaathi Copilot. As we talk or when you scan your documents, watch your live Citizen Entitlement Dossier populate on the left with official statutory proofs.",
          },
        ],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Handle URL pre-seeded prompt
  useEffect(() => {
    if (initialPrompt && !hasSentInitialPrompt.current && status === 'ready') {
      hasSentInitialPrompt.current = true;
      sendMessage({ text: initialPrompt });
    }
  }, [initialPrompt, status, sendMessage]);

  // Text-to-Speech
  useEffect(() => {
    if (!voiceOutputEnabled || isLoading || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.id !== lastSpokenMessageRef.current) {
      lastSpokenMessageRef.current = lastMessage.id;
      const utterance = new SpeechSynthesisUtterance(getMessageText(lastMessage));
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, isLoading, voiceOutputEnabled, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    clearError();
    sendMessage({ text: input });
    setInput('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerateForm = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForAction(scheme);
    }
  };

  const handleViewDetails = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForDetails(scheme);
    }
  };

  const handleVerifyProof = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForProof(scheme);
    }
  };

  const handleDigiLockerVerify = (verifiedData: Partial<UserProfile>) => {
    updateAndSaveProfile(prev => ({ ...prev, ...verifiedData }));
    clearError();
    sendMessage({
      text: 'My DigiLocker profile has been successfully connected and verified. Please update my dossier.',
    });
  };

  const handleFileUpload = () => {
    setIsScannerOpen(true);
  };

  const handleScannerConfirm = (extractedData: Partial<UserProfile>) => {
    updateAndSaveProfile(prev => ({ ...prev, ...extractedData }));
    clearError();
    sendMessage({
      text: `Document scanned via OCR: Name: ${extractedData.name || 'Citizen'}, Age: ${extractedData.age || 'Verified'}, Gender: ${extractedData.gender || 'Verified'}, State: ${extractedData.state || 'Verified'}. Please evaluate my statutory eligibility.`,
    });
  };

  const handleChipClick = (promptText: string) => {
    if (isLoading) return;
    clearError();
    sendMessage({ text: promptText });
  };

  const benefitSummary = calculateBenefitSummary(matchedSchemes);
  const scrutiny = inspectProfileDbtScrutiny(profile);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      
      {/* State Selector Modal */}
      {(!profile.state && !hasSkippedStateSelection) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="organic-card p-6 w-full max-w-md flex flex-col gap-4 bg-card">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-black">Select Your State / UT</h3>
              <button onClick={() => setHasSkippedStateSelection(true)} className="p-1 hover:bg-card-border rounded-lg text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-bold text-muted-foreground">Select your home state to unlock location-specific state welfare schemes.</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
              {indianStates.map(st => (
                <button
                  key={st}
                  onClick={() => {
                    updateAndSaveProfile(prev => ({ ...prev, state: st }));
                    setHasSkippedStateSelection(true);
                  }}
                  className="px-3 py-2 text-left text-xs font-bold rounded-lg hover:bg-primary/20 hover:text-primary transition-colors border border-card-border"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DigiLockerModal 
        isOpen={isDigiLockerOpen} 
        onClose={() => setIsDigiLockerOpen(false)} 
        onVerify={handleDigiLockerVerify} 
      />
      <ActionPlanModal 
        isOpen={!!selectedSchemeForAction}
        onClose={() => setSelectedSchemeForAction(null)}
        scheme={selectedSchemeForAction}
        profile={profile}
        onVerifyProof={(scheme) => setSelectedSchemeForProof(scheme)}
      />
      <SchemeDetailModal
        isOpen={!!selectedSchemeForDetails}
        onClose={() => setSelectedSchemeForDetails(null)}
        scheme={selectedSchemeForDetails}
      />
      <ProofGraphModal
        isOpen={!!selectedSchemeForProof}
        onClose={() => setSelectedSchemeForProof(null)}
        scheme={selectedSchemeForProof}
        profile={profile}
      />
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onConfirm={handleScannerConfirm}
      />
      <CitizenWelfareCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        profile={profile}
        schemes={matchedSchemes}
      />

      {/* Mobile Top Navigation & Tab Switcher */}
      <div className="lg:hidden flex flex-col border-b-2 border-foreground bg-card z-20">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="px-3 py-1 rounded-full border-2 border-foreground bg-accent text-foreground text-[11px] font-black shadow-[2px_2px_0px_0px_var(--foreground)] flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Welfare Card</span>
            </button>
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className="px-2 py-1 rounded-lg border-2 border-foreground bg-card text-[11px] font-black text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]"
            >
              {language === 'en' ? 'EN' : 'HI'}
            </button>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        <div className="grid grid-cols-2 border-t border-foreground/15 text-xs font-black">
          <button
            onClick={() => setMobileTab('dossier')}
            className={`py-2.5 text-center border-r border-foreground/15 flex items-center justify-center gap-1.5 ${mobileTab === 'dossier' ? 'bg-primary text-foreground font-black' : 'text-muted-foreground'}`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Live Dossier ({matchedSchemes.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('copilot')}
            className={`py-2.5 text-center flex items-center justify-center gap-1.5 ${mobileTab === 'copilot' ? 'bg-primary text-foreground font-black' : 'text-muted-foreground'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE (58%): Living Citizen Entitlement Dossier & Application Canvas */}
        <div className={`w-full lg:w-[58%] border-r-2 border-foreground bg-background flex-col overflow-y-auto ${mobileTab === 'dossier' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Top Sticky Benefit Ticker Bar */}
          <div className="sticky top-0 z-10 bg-secondary/70 backdrop-blur-md border-b-2 border-foreground p-4 md:p-6 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded border border-foreground/20">
                    Living Citizen Entitlement Ledger
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Statutory DAG Active
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-serif text-foreground">
                    {benefitSummary.formattedTotal}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    / annual value unlocked
                  </span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(true)}
                  className="px-3 py-2 rounded-xl border-2 border-foreground bg-accent text-accent-foreground text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
                  title="View and download your official Citizen Welfare Card"
                >
                  <Award className="w-4 h-4" />
                  <span>Welfare Card</span>
                </button>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="px-3 py-2 rounded-xl border-2 border-foreground bg-card text-foreground text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
                  title="Scan your Aadhaar or Voter ID"
                >
                  <Scan className="w-4 h-4 text-primary" />
                  <span>Scan ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDigiLockerOpen(true)}
                  className="px-3 py-2 rounded-xl border-2 border-foreground bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
                  title="Connect official DigiLocker account"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>DigiLocker</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-foreground/15 text-[11px] font-black">
              <span className="px-2.5 py-1 rounded-full bg-background border border-foreground/20 text-foreground">
                Verified Schemes: <strong className="text-primary font-black">{benefitSummary.verifiedSchemeCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-background border border-foreground/20 text-foreground">
                Direct Cash DBT: <strong className="text-emerald-700 font-black">₹{benefitSummary.directCashTotal.toLocaleString('en-IN')}</strong>
              </span>
              {benefitSummary.insuranceCoverTotal > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-background border border-foreground/20 text-foreground">
                  Risk Cover: <strong className="text-blue-700 font-black">₹{benefitSummary.insuranceCoverTotal.toLocaleString('en-IN')}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Dossier Body Content */}
          <div className="p-4 md:p-6 space-y-6">
            
            {/* Standardized Form Preview Canvas */}
            <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-foreground/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-serif font-black text-base text-foreground leading-tight">
                      Standardized Public Welfare Application Dossier
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Auto-Populated Form No. 1 · Common Citizen Registry
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-400 text-emerald-800 text-[10px] font-black">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profile.verified ? 'Verified Citizen' : 'Active Draft'}</span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Full Legal Name</span>
                  <span className="font-bold text-foreground block truncate">
                    {profile.name || 'Not Declared (Pending)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Age & Gender</span>
                  <span className="font-bold text-foreground block">
                    {profile.age ? `${profile.age} Yrs` : '--'} · {profile.gender || '--'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Domicile State</span>
                  <span className="font-bold text-foreground block truncate">
                    {profile.state || 'Not Declared'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Primary Occupation</span>
                  <span className="font-bold text-foreground block truncate">
                    {profile.occupation || 'Not Declared'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Landholding</span>
                  <span className="font-bold text-foreground block">
                    {profile.landHoldingHectares !== undefined ? `${profile.landHoldingHectares} ha` : '--'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-foreground/20 bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Annual Income</span>
                  <span className="font-bold text-foreground block">
                    {(profile.annualIncome || profile.income) ? `₹${(profile.annualIncome || profile.income)?.toLocaleString('en-IN')}` : '--'}
                  </span>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div className="pt-3 border-t border-foreground/15 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mr-1">
                  Required Documents:
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${(profile.aadhaarNumber || profile.aadhaarLast4 || profile.verified) ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-muted/50 text-muted-foreground border-foreground/20'}`}>
                  {(profile.aadhaarNumber || profile.aadhaarLast4 || profile.verified) ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} Aadhaar ID
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${profile.digilockerId ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-muted/50 text-muted-foreground border-foreground/20'}`}>
                  {profile.digilockerId ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} DigiLocker eKYC
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${profile.landHoldingHectares !== undefined ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-muted/50 text-muted-foreground border-foreground/20'}`}>
                  {profile.landHoldingHectares !== undefined ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} Land Record (RoR)
                </span>
              </div>

              {/* DBT Pre-Scrutiny & NPCI Linkage Status (Haqdarshak Model) */}
              <div className="mt-3 pt-3 border-t border-foreground/15">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Haqdarshak-Inspired Pre-Scrutiny &amp; NPCI Seeding
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${scrutiny.dbtReady ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : 'bg-amber-100 text-amber-900 border-amber-400'}`}>
                    {scrutiny.dbtReady ? '✓ Ready for DBT' : '⚠️ Action Advised'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                  {scrutiny.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-background border border-foreground/15">
                      <span className="truncate mr-1 text-muted-foreground">{item.item}</span>
                      <span className={`text-[10px] shrink-0 font-black ${item.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.passed ? '✓ Validated' : '○ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Matched Schemes Stream */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black font-serif text-foreground">
                    Pre-Qualified Government Schemes
                  </h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground border-2 border-foreground">
                    {matchedSchemes.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                  Statutory proof verified via formal rules
                </span>
              </div>

              {matchedSchemes.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-foreground/30 bg-card/60 text-center animate-fade-in">
                  <Building2 className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                  <h4 className="font-serif font-black text-lg text-foreground mb-1">
                    No Schemes Matched Yet
                  </h4>
                  <p className="text-xs font-bold text-muted-foreground max-w-sm mx-auto mb-4">
                    Answer the prompts in the Copilot pane on the right or scan your ID to instantly calculate your entitlements.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPT_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleChipClick(chip.text)}
                        className="px-3 py-1.5 rounded-full border border-foreground/30 bg-background text-[11px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedSchemes.map((scheme) => (
                    <SchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      profile={profile}
                      onGenerateForm={handleGenerateForm}
                      onViewDetails={handleViewDetails}
                      onVerifyProof={handleVerifyProof}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT PANE (42%): AI Welfare Copilot */}
        <div className={`w-full lg:w-[42%] flex-col bg-background relative h-full ${mobileTab === 'copilot' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Copilot Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-foreground bg-card">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <div className="h-4 w-px bg-foreground/20" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-serif font-black text-sm text-foreground">Welfare Copilot</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                className={`p-1.5 rounded-lg border-2 transition-colors ${voiceOutputEnabled ? 'bg-primary border-foreground text-primary-foreground shadow-[2px_2px_0px_0px_var(--foreground)]' : 'border-card-border/40 text-muted-foreground hover:bg-card/50'}`}
                title="Toggle vernacular voice output"
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button 
                type="button"
                onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                className="px-2.5 py-1 rounded-lg border-2 border-foreground bg-card text-xs font-black text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'en' ? 'EN' : 'HI'}
              </button>
            </div>
          </div>

          {/* Quick Prompt Carousel / Chips */}
          <div className="px-4 py-2.5 bg-accent/15 border-b border-foreground/15 overflow-x-auto flex items-center gap-2 no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-foreground" /> Quick Pick:
            </span>
            {QUICK_PROMPT_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.text)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full border border-foreground/30 bg-card hover:bg-primary/30 text-foreground text-[11px] font-bold whitespace-nowrap transition-colors shadow-[1px_1px_0px_0px_var(--foreground)] shrink-0 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && messages[messages.length - 1].role === 'user' && (
              <div className="flex w-full justify-start animate-fade-in">
                <div className="bg-card border-2 border-foreground rounded-[16px] rounded-tl-[4px] shadow-[4px_4px_0px_0px_var(--foreground)] p-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Dock */}
          <div className="p-4 border-t-2 border-foreground bg-card">
            <ChatInput 
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onFileUpload={handleFileUpload}
              language={language}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground text-sm font-black font-serif">
        Loading Welfare Workspace...
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
