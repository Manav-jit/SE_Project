'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { SchemeCard } from '@/components/SchemeCard';
import { Scheme } from '@/lib/schemes/loader';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { ProofGraphModal } from '@/components/dag/ProofGraphModal';
import { UserProfile, getStoredProfile, PROFILE_EVENT } from '@/lib/chat/profile';

export default function DashboardClient({ schemes }: { schemes: Scheme[] }) {
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
      
      <div className="mb-12 relative z-10 animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-4xl sm:text-5xl font-black font-serif flex items-center gap-3">
          <Bookmark className="w-9 h-9 text-primary" />
          Saved Schemes
        </h1>
        <p className="text-muted-foreground font-bold mt-2 max-w-xl">
          Manage your bookmarked government schemes and track your application readiness progress.
        </p>
      </div>

      {savedSchemes.length === 0 ? (
        <div className="organic-card p-12 flex flex-col items-center justify-center text-center animate-fade-in relative z-10 bg-[#F9FFF4]">
          <div className="w-20 h-20 bg-primary/20 rounded-full border-2 border-foreground flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_var(--foreground)]">
            <Bookmark className="w-10 h-10 text-foreground" />
          </div>
          <h2 className="text-2xl font-black font-serif mb-3">No saved schemes yet</h2>
          <p className="text-muted-foreground font-bold max-w-md mb-8">
            Bookmark any scheme from Chat, Wizard, or Categories to track your documents and generate your pre-filled forms.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/chat" className="px-8 py-3 organic-button text-sm">
              Discover via Chat
            </Link>
            <Link href="/categories" className="px-8 py-3 rounded-full border-2 border-foreground bg-card text-foreground font-black uppercase tracking-wider text-xs hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all">
              Browse Categories
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
      )}
    </div>
  );
}
