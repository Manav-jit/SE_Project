'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Zap, Bot, Wand, 
  Search, Sparkles, Layers
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

const QUICK_PERSONA_PILLS = [
  { label: '🌾 Small Farmer (1.5 ha)', query: 'I am a small farmer with 1.5 hectares of land' },
  { label: '🎓 Student Scholarship', query: 'I am a student looking for government scholarships' },
  { label: '👩‍👧 Women & Mother Support', query: 'I am a woman looking for maternity and family welfare schemes' },
  { label: '💼 Artisan / Street Vendor', query: 'I am a small street vendor and artisan needing working capital' },
  { label: '👴 Senior Citizen Pension', query: 'I am a senior citizen aged 65 seeking social security pension' },
];

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePillClick = (queryText: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(queryText)}`);
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[130px] pointer-events-none" />

      <div className="flex-1 max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col relative z-10 w-full">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary border-2 border-foreground shadow-[3px_3px_0px_0px_var(--foreground)] flex items-center justify-center text-foreground font-black text-2xl font-serif">
              S
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-serif text-foreground block leading-tight">
                SchemeSaathi
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Digital Welfare Infrastructure
              </span>
            </div>
          </div>
          
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link 
              href="/track" 
              className="text-xs sm:text-sm font-black text-muted-foreground hover:text-foreground transition-colors hidden sm:inline uppercase tracking-wider"
            >
              {t('nav.track_status')}
            </Link>
            <Link 
              href="/dashboard" 
              className="text-xs sm:text-sm font-black text-muted-foreground hover:text-foreground transition-colors hidden sm:inline uppercase tracking-wider"
            >
              {t('nav.saved_schemes')}
            </Link>
            <Link 
              href="/chat" 
              className="text-xs sm:text-sm px-5 py-2.5 transition-all organic-button flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span>{t('nav.open_chat')}</span>
            </Link>
          </nav>
        </header>

        {/* Hero Section: Command Launchpad */}
        <section className="text-center mb-16 relative max-w-3xl mx-auto">
          
          {/* Sovereign Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-foreground/30 text-xs font-black text-foreground uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Formal Statutory DAG Verification · Zero PII Remote Storage</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-6 font-serif text-foreground">
            {t('hero.title_line1')}{' '}
            <span className="text-primary underline decoration-foreground/30 underline-offset-4 decoration-wavy">
              {t('hero.title_line2')}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg font-bold text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            {t('hero.subtitle')}
          </p>

          {/* Unified Universal Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full relative max-w-2xl mx-auto mb-5"
          >
            <div className="relative flex items-center rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)] overflow-hidden transition-all focus-within:shadow-[6px_6px_0px_0px_var(--foreground)] focus-within:translate-y-[-1px]">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe yourself or a scheme (e.g., Small Farmer, Student, Housing)..."
                className="w-full px-4 py-3.5 sm:py-4 bg-transparent text-foreground placeholder:text-muted-foreground font-bold text-sm sm:text-base outline-none"
              />
              <button
                type="submit"
                className="mr-2 px-5 py-2.5 sm:py-3 rounded-xl bg-primary border-2 border-foreground text-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_0px_var(--foreground)]"
              >
                <span>Diagnose</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* 1-Tap Quick Persona Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Popular:
            </span>
            {QUICK_PERSONA_PILLS.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => handlePillClick(pill.query)}
                className="px-3 py-1.5 rounded-full border border-foreground/30 bg-card hover:bg-primary/20 text-foreground text-xs font-bold transition-all shadow-[1px_1px_0px_0px_var(--foreground)] hover:translate-y-[-1px]"
              >
                {pill.label}
              </button>
            ))}
          </div>

        </section>

        {/* Structured Tri-Panel Pathways */}
        <section aria-label="Welfare Discovery Channels" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: Live Welfare Workspace */}
          <Link 
            href="/chat"
            className="group organic-card p-6 flex flex-col no-underline bg-card hover:border-foreground"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                <Bot className="w-6 h-6 text-foreground" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Flagship Copilot
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground font-serif mb-2">
              Split-Pane Welfare Copilot
            </h2>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6">
              Interact with the AI Copilot while your live Government Application Dossier auto-populates on the left with official DAG proofs.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground group-hover:gap-2.5 transition-all">
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </Link>

          {/* Card 2: Instant DigiLocker eKYC */}
          <Link 
            href="/wizard?mode=digilocker"
            className="group organic-card p-6 flex flex-col no-underline bg-card hover:border-foreground"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFE5B4] border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                <ShieldCheck className="w-6 h-6 text-foreground" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-400 text-[10px] font-black uppercase tracking-wider">
                Instant eKYC
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground font-serif mb-2">
              DigiLocker Auto-Match
            </h2>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6">
              Connect your DigiLocker or scan your Aadhaar with AI OCR to verify your identity in 30 seconds with zero questions asked.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground group-hover:gap-2.5 transition-all">
              <span>Connect &amp; Match</span>
              <Zap className="w-4 h-4 text-accent" fill="currentColor" />
            </div>
          </Link>

          {/* Card 3: 3-Step Quick Wizard */}
          <Link 
            href="/wizard"
            className="group organic-card p-6 flex flex-col no-underline bg-card hover:border-foreground"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
                <Wand className="w-6 h-6 text-foreground" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-400 text-[10px] font-black uppercase tracking-wider">
                30-Second Quiz
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground font-serif mb-2">
              Quick-Match Wizard
            </h2>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6">
              Answer 3 simple taps — Age, Occupation, and Domicile State — and instantly see your qualified central and state schemes.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground group-hover:gap-2.5 transition-all">
              <span>Start 30s Wizard</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
          </Link>

        </section>

        {/* DPI Credibility & Metric Bar */}
        <section aria-label="National Public Infrastructure Statistics" className="rounded-2xl border-2 border-foreground bg-card p-6 mb-12 shadow-[4px_4px_0px_0px_var(--foreground)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif text-foreground block">20 Schemes</span>
              <span className="text-xs font-bold text-muted-foreground mt-0.5 block">Central &amp; State Catalog</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif text-foreground block">Formal DAG</span>
              <span className="text-xs font-bold text-muted-foreground mt-0.5 block">Statutory Rule Proofs</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif text-foreground block">Client OCR</span>
              <span className="text-xs font-bold text-muted-foreground mt-0.5 block">Zero Remote PII Stored</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-serif text-foreground block">Instant PDF</span>
              <span className="text-xs font-bold text-muted-foreground mt-0.5 block">Standardized Govt Forms</span>
            </div>
          </div>
        </section>

        {/* Categories Explorer Link Strip */}
        <section className="text-center mb-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Or browse all welfare programs by sector (Agriculture, Health, Education, Housing) &rarr;</span>
          </Link>
        </section>

        {/* Trust & Compliance Footer */}
        <footer className="text-center text-xs font-bold text-muted-foreground pb-8 mt-auto border-t border-foreground/15 pt-6">
          <p>
            SchemeSaathi Digital Public Infrastructure &nbsp;·&nbsp; Data sourced from official Ministry Portals &nbsp;·&nbsp; Privacy First
          </p>
        </footer>

      </div>
    </main>
  );
}
