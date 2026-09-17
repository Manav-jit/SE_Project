import Link from 'next/link';
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles, LayoutGrid, Zap, ClipboardList, Cloud } from 'lucide-react';

// A simple SVG 4-point star for decoration
const FourPointStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="currentColor"/>
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      
      {/* Decorative Sparkles & Dots */}
      <FourPointStar className="absolute top-20 left-1/4 w-6 h-6 text-accent animate-drift-1 opacity-70" />
      <FourPointStar className="absolute bottom-32 right-1/3 w-8 h-8 text-primary animate-drift-2 opacity-80" />
      <FourPointStar className="absolute top-1/2 right-16 w-5 h-5 text-accent animate-drift-3 opacity-60" />
      <div className="absolute top-32 right-1/4 w-3 h-3 rounded-full bg-accent animate-drift-2 opacity-70" />
      <div className="absolute bottom-40 left-20 w-4 h-4 rounded-full bg-primary animate-drift-1 opacity-60" />

      {/* Floating Schemes (Clouds) */}
      <div className="floating-cloud animate-drift-1" style={{ top: '15%', left: '8%' }}>
        <Cloud className="w-5 h-5 text-foreground" fill="currentColor" />
        PM Awas Yojana
      </div>
      <div className="floating-cloud animate-drift-2" style={{ bottom: '25%', right: '10%' }}>
        <Cloud className="w-5 h-5 text-foreground" fill="currentColor" />
        Ayushman Bharat
      </div>
      <div className="floating-cloud animate-drift-3" style={{ top: '45%', left: '30%' }}>
        <Cloud className="w-5 h-5 text-foreground" fill="currentColor" />
        PM Kisan Samman Nidhi
      </div>
      <div className="floating-cloud animate-drift-1" style={{ top: '35%', right: '25%', animationDelay: '2s' }}>
        <Cloud className="w-5 h-5 text-foreground" fill="currentColor" />
        Sukanya Samriddhi
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col relative z-10 w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 animate-sequence stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary border-[2.5px] border-foreground shadow-[3px_3px_0px_0px_var(--foreground)] flex items-center justify-center text-foreground font-black text-2xl font-serif">
              S
            </div>
            <span className="text-3xl font-black tracking-tight font-serif text-foreground">SchemeSaathi</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-base font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:inline uppercase tracking-wide"
            >
              Saved Schemes
            </Link>
            <Link 
              href="/chat" 
              className="text-base px-6 py-2.5 transition-all organic-button"
            >
              Open Chat
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="text-center mb-20 animate-sequence stagger-2 relative">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E2F1C1] border-2 border-foreground rounded-full shadow-[3px_3px_0px_0px_var(--foreground)] text-foreground text-sm font-black uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 text-accent" fill="currentColor" />
            <span>AI-Powered Discovery</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-6 font-serif text-foreground">
            Find schemes you <br className="hidden sm:block" />
            <span className="text-primary" style={{ textShadow: '2px 2px 0px var(--foreground)' }}>
              actually qualify for!
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl font-bold text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover eligible Indian government welfare schemes — through chat, one-click verification, a quick form, or by exploring sectors.
          </p>
        </section>

        {/* Discovery Methods Grid */}
        <section aria-label="Ways to discover schemes" className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          
          {/* Card 1: Chat with AI */}
          <Link 
            href="/chat"
            className="group organic-card p-8 flex flex-col gap-6 no-underline animate-sequence stagger-3"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E2F1C1] border-2 border-foreground flex items-center justify-center shrink-0">
                <MessageSquare className="w-7 h-7 text-foreground" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black text-foreground font-serif">Chat with AI</h2>
            </div>
            <p className="text-base font-bold text-muted-foreground leading-relaxed">
              Have a guided conversation. Tell us about yourself and get personalized scheme recommendations.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-foreground font-black uppercase tracking-wider group-hover:gap-4 transition-all">
              Start Chatting <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Card 2: DigiLocker Instant Match */}
          <Link 
            href="/wizard?mode=digilocker"
            className="group organic-card p-8 flex flex-col gap-6 no-underline animate-sequence stagger-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFE5B4] border-2 border-foreground flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-foreground" />
              </div>
              <h2 className="text-2xl font-black text-foreground font-serif">Instant DigiLocker</h2>
            </div>
            <p className="text-base font-bold text-muted-foreground leading-relaxed">
              Connect your DigiLocker, auto-verify your identity, and see eligible schemes instantly. No questions asked.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-foreground font-black uppercase tracking-wider group-hover:gap-4 transition-all">
              Connect &amp; Match <Zap className="w-5 h-5" fill="currentColor" />
            </div>
          </Link>

          {/* Card 3: Quick-Match Wizard */}
          <Link 
            href="/wizard"
            className="group organic-card p-8 flex flex-col gap-6 no-underline animate-sequence stagger-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E2F1C1] border-2 border-foreground flex items-center justify-center shrink-0">
                <ClipboardList className="w-7 h-7 text-foreground" />
              </div>
              <h2 className="text-2xl font-black text-foreground font-serif">Quick-Match Wizard</h2>
            </div>
            <p className="text-base font-bold text-muted-foreground leading-relaxed">
              Answer 3 simple steps — age, occupation, and state — and get matched in under 30 seconds.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-foreground font-black uppercase tracking-wider group-hover:gap-4 transition-all">
              Take the Quiz <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Card 4: Browse by Category */}
          <Link 
            href="/categories"
            className="group organic-card p-8 flex flex-col gap-6 no-underline animate-sequence stagger-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFE5B4] border-2 border-foreground flex items-center justify-center shrink-0">
                <LayoutGrid className="w-7 h-7 text-foreground" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black text-foreground font-serif">Browse by Category</h2>
            </div>
            <p className="text-base font-bold text-muted-foreground leading-relaxed">
              Explore schemes by sector — Agriculture, Healthcare, Housing and more. Find what matters to you.
            </p>
            <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-foreground font-black uppercase tracking-wider group-hover:gap-4 transition-all">
              Explore Categories <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

        </section>

        {/* Trust bar */}
        <footer className="text-center text-sm font-bold text-muted-foreground pb-8 animate-sequence stagger-5 mt-auto">
          <p>100% Free &amp; Open Source &nbsp;·&nbsp; Data sourced from official portals &nbsp;·&nbsp; Privacy First</p>
        </footer>
      </div>
    </main>
  );
}
