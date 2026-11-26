'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, FileCheck, Clock, ArrowRight } from 'lucide-react';
import { SchemeCard } from '@/components/SchemeCard';
import { Scheme } from '@/lib/schemes/loader';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { ProofGraphModal } from '@/components/dag/ProofGraphModal';
import { UserProfile, getStoredProfile, PROFILE_EVENT } from '@/lib/chat/profile';
import { ApplicationRecord } from '@/lib/storage/applications';
import { useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function DashboardClient({ schemes }: { schemes: Scheme[] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'saved' | 'applications'>('saved');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
      return schemes.filter(s => savedIds.includes(s.id));
    } catch {
      return [];
    }
  });
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState<Scheme | null>(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<Scheme | null>(null);
  const [selectedSchemeForProof, setSelectedSchemeForProof] = useState<Scheme | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());

  useEffect(() => {
    // Fetch submitted applications
    fetch('/api/applications')
      .then(r => r.json())
      .then(d => {
        if (d.applications) setApplications(d.applications);
      })
      .catch(console.error);

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      setProfile(customEvent.detail || getStoredProfile());
    };

    const handleStorage = () => {
      try {
        const savedIds: string[] = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
        setSavedSchemes(schemes.filter(s => savedIds.includes(s.id)));
        setProfile(getStoredProfile());
      } catch {
        // ignore
      }
    };

    window.addEventListener(PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [schemes]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 max-w-6xl mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      
      <ActionPlanModal 
        isOpen={!!selectedSchemeForAction}
        onClose={() => setSelectedSchemeForAction(null)}
        scheme={selectedSchemeForAction}
        profile={profile}
        onVerifyProof={(s) => setSelectedSchemeForProof(s)}
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
      
      <div className="mb-8 relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back_home')}</span>
          </Link>
          <LanguageToggle />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black font-serif flex items-center gap-3">
              <Bookmark className="w-9 h-9 text-primary" />
              {t('dash.title')}
            </h1>
            <p className="text-muted-foreground font-bold mt-2 max-w-xl">
              {t('dash.subtitle')}
            </p>
          </div>
          <Link 
            href="/track" 
            className="self-start sm:self-center px-5 py-2.5 rounded-full border-2 border-foreground bg-accent text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all"
          >
            <Clock className="w-4 h-4" />
            {t('dash.live_portal')}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mt-8 border-b-2 border-foreground/15 pb-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${activeTab === 'saved' ? 'border-foreground bg-primary text-foreground shadow-[3px_3px_0px_0px_var(--foreground)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Bookmark className="w-4 h-4" />
            {t('dash.tab_saved')} ({savedSchemes.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'border-foreground bg-primary text-foreground shadow-[3px_3px_0px_0px_var(--foreground)]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <FileCheck className="w-4 h-4" />
            {t('dash.tab_apps')} ({applications.length})
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        savedSchemes.length === 0 ? (
          <div className="organic-card p-12 flex flex-col items-center justify-center text-center animate-fade-in relative z-10 bg-card">
            <div className="w-20 h-20 bg-primary/20 rounded-full border-2 border-foreground flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_var(--foreground)]">
              <Bookmark className="w-10 h-10 text-foreground" />
            </div>
            <h2 className="text-2xl font-black font-serif mb-3">{t('dash.no_saved_title')}</h2>
            <p className="text-muted-foreground font-bold max-w-md mb-8">
              {t('dash.no_saved_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/chat" className="px-8 py-3 organic-button text-sm">
                {t('dash.discover_chat')}
              </Link>
              <Link href="/categories" className="px-8 py-3 rounded-full border-2 border-foreground bg-card text-foreground font-black uppercase tracking-wider text-xs hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all">
                {t('dash.browse_cat')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in relative z-10">
            {savedSchemes.map(scheme => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                profile={profile}
                onGenerateForm={(id) => setSelectedSchemeForAction(schemes.find(s => s.id === id) || null)} 
                onViewDetails={(id) => setSelectedSchemeForDetails(schemes.find(s => s.id === id) || null)}
                onVerifyProof={(id) => setSelectedSchemeForProof(schemes.find(s => s.id === id) || null)}
              />
            ))}
          </div>
        )
      ) : (
        /* Applications Tab */
        <div className="space-y-4 animate-fade-in relative z-10">
          {applications.length === 0 ? (
            <div className="organic-card p-12 flex flex-col items-center justify-center text-center bg-card">
              <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-black font-serif mb-2">No Applications Submitted Yet</h2>
              <p className="text-xs font-bold text-muted-foreground max-w-sm mb-6">
                When you generate and download a form for any scheme, your application reference will automatically appear here.
              </p>
              <Link href="/wizard" className="px-6 py-2.5 organic-button text-xs font-black">
                Find Eligible Schemes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map(app => (
                <div key={app.id} className="organic-card p-6 bg-card space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-black text-primary bg-primary/20 px-2 py-0.5 rounded border border-foreground/30">
                        {app.id}
                      </span>
                      <h3 className="font-black font-serif text-lg text-foreground mt-2">{app.schemeName}</h3>
                      <p className="text-xs font-bold text-muted-foreground">{app.cscCenter || 'Central Online Portal'}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border-2 border-foreground bg-primary/20 text-foreground">
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-foreground/15 flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Link 
                      href={`/track?id=${app.id}`}
                      className="inline-flex items-center gap-1 font-black underline text-foreground hover:text-primary transition-colors"
                    >
                      View Live Timeline <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
