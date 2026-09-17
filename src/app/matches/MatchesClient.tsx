'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Building2, FileText, ExternalLink, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { Scheme } from '@/lib/schemes/loader';
import { UserProfile } from '@/lib/chat/profile';

export default function MatchesClient() {
  const searchParams = useSearchParams();
  const profileStr = searchParams.get('profile');

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem('saved_schemes') || '[]'));
  }, []);

  useEffect(() => {
    async function fetchMatches() {
      setIsLoading(true);
      try {
        let url = '/api/schemes';
        if (profileStr) {
          url += `?profile=${profileStr}`;
          const parsed = JSON.parse(decodeURIComponent(profileStr));
          setProfile(parsed);
        }
        const res = await fetch(url);
        const data = await res.json();
        setSchemes(data.schemes || []);
      } catch (e) {
        console.error('Failed to fetch matches', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMatches();
  }, [profileStr]);

  const toggleSave = (schemeId: string) => {
    const current = JSON.parse(localStorage.getItem('saved_schemes') || '[]');
    let next: string[];
    if (current.includes(schemeId)) {
      next = current.filter((id: string) => id !== schemeId);
    } else {
      next = [...current, schemeId];
    }
    localStorage.setItem('saved_schemes', JSON.stringify(next));
    setSavedIds(next);
  };

  // Profile summary for the header
  const profileSummary = [
    profile.age && `${profile.age} years old`,
    profile.gender,
    profile.occupation,
    profile.state,
  ].filter(Boolean).join(' · ');

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-15%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[25%] h-[25%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Matched Schemes</h1>
          </div>
          {profileSummary && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              Based on: {profileSummary}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in" aria-busy="true">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-foreground font-medium">Finding your best matches...</p>
            <p className="text-sm text-muted-foreground">Analyzing eligibility across all schemes</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && schemes.length === 0 && (
          <div className="glass-panel p-12 text-center animate-fade-in" role="status">
            <h2 className="text-xl font-semibold mb-2">No matches found</h2>
            <p className="text-sm text-muted-foreground mb-6">Try the wizard again with different details, or browse categories.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/wizard" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Try Wizard Again
              </Link>
              <Link href="/categories" className="px-5 py-2.5 rounded-lg border border-card-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Browse Categories
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && schemes.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6 animate-fade-in">
              Found <span className="text-foreground font-medium">{schemes.length}</span> {schemes.length === 1 ? 'scheme' : 'schemes'} matching your profile
            </p>

            <div className="space-y-4 stagger-children" role="list" aria-label="Matched schemes">
              {schemes.map((scheme, i) => {
                const isSaved = savedIds.includes(scheme.id);
                return (
                  <article key={scheme.id} className="glass-panel p-6 flex flex-col gap-4 transition-all hover:border-card-border/50" role="listitem">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm font-bold text-primary">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-foreground">{scheme.name}</h2>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{scheme.ministry}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSave(scheme.id)}
                        className="p-1.5 rounded-md hover:bg-card-border transition-colors text-muted-foreground hover:text-primary shrink-0"
                        aria-label={isSaved ? `Remove ${scheme.name} from saved` : `Save ${scheme.name}`}
                      >
                        {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Benefits */}
                    <p className="text-sm text-foreground/80 leading-relaxed">{scheme.benefits}</p>

                    {/* Docs */}
                    {scheme.documents_required && scheme.documents_required.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.documents_required.map(doc => (
                          <span key={doc} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card-border/50 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-card-border">
                      {scheme.submission_url && (
                        <a
                          href={scheme.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Apply Now <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        href="/chat"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-card-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Ask AI about this
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm text-muted-foreground mb-4">Want more detailed guidance on how to apply?</p>
              <Link href="/chat" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all">
                Chat with SchemeSaathi AI
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
