'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { SchemeCard } from '@/components/SchemeCard';
import { Scheme } from '@/lib/schemes/loader';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { UserProfile } from '@/lib/chat/profile';

export default function DashboardClient({ schemes }: { schemes: Scheme[] }) {
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState<Scheme | null>(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<Scheme | null>(null);

  // Mock profile since we don't have global state. In a real app, this would come from Context.
  const profile: UserProfile = { verified: true, state: "Maharashtra" };

  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
    setSavedSchemes(schemes.filter(s => savedIds.includes(s.id)));
  }, [schemes]);

  // Handle updates when a scheme is un-saved
  const handleStorageChange = () => {
    const savedIds = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
    setSavedSchemes(schemes.filter(s => savedIds.includes(s.id)));
  };

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    // Also poll occasionally since local storage changes in same window don't trigger 'storage' event always
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
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
      />
      <SchemeDetailModal
        isOpen={!!selectedSchemeForDetails}
        onClose={() => setSelectedSchemeForDetails(null)}
        scheme={selectedSchemeForDetails}
      />
      
      <div className="mb-12 relative z-10 animate-fade-in">
        <Link href="/chat" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Chat</span>
        </Link>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-primary" />
          Saved Schemes
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Manage your bookmarked government schemes and track your application readiness progress.</p>
      </div>

      {savedSchemes.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center animate-fade-in relative z-10 border border-card-border shadow-[0_0_50px_rgba(59,130,246,0.05)]">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-primary/60" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">No saved schemes yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Go back to the chat and click the bookmark icon on any scheme to save it for later review and fast-track your applications.
          </p>
          <Link href="/chat" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Discover Schemes Now
          </Link>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
