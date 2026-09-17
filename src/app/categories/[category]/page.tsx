'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Scheme } from '@/lib/schemes/loader';

const categoryMeta: Record<string, { name: string; color: string }> = {
  agriculture: { name: 'Agriculture', color: '#22c55e' },
  healthcare: { name: 'Healthcare', color: '#ef4444' },
  housing: { name: 'Housing', color: '#f59e0b' },
  education: { name: 'Education', color: '#3b82f6' },
  'women-and-child': { name: 'Women & Child', color: '#ec4899' },
  employment: { name: 'Employment', color: '#8b5cf6' },
};

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.category as string;
  const meta = categoryMeta[slug] || { name: slug, color: '#3b82f6' };

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchemes() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/schemes?category=${slug}`);
        const data = await res.json();
        setSchemes(data.schemes || []);
      } catch (e) {
        setError('Failed to load schemes for this category.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchemes();
  }, [slug]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-5%] w-[30%] h-[30%] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: `${meta.color}15` }} />

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            All Categories
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span style={{ color: meta.color }}>{meta.name}</span> Schemes
          </h1>
          <p className="text-muted-foreground mt-2">All government welfare schemes under the {meta.name} sector.</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in" aria-busy="true" aria-label="Loading schemes">
            <Loader2 className="w-8 h-8 text-foreground animate-spin" />
            <p className="text-sm font-bold text-foreground">Loading schemes...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="organic-card p-8 text-center animate-fade-in" role="alert">
            <p className="text-red-600 font-bold">{error}</p>
            <Link href="/categories" className="text-sm font-bold text-foreground mt-4 inline-block hover:underline">Go back to categories</Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && schemes.length === 0 && (
          <div className="organic-card p-12 text-center animate-fade-in bg-[#F9FFF4]" role="status">
            <h2 className="text-xl font-black font-serif mb-2">No schemes available yet</h2>
            <p className="text-sm font-medium text-muted-foreground mb-6">We are continuously adding more government schemes. Check back soon!</p>
            <Link href="/categories" className="inline-flex items-center gap-2 px-5 py-2.5 organic-button text-sm">
              <ArrowLeft className="w-4 h-4" /> Browse other categories
            </Link>
          </div>
        )}

        {/* Schemes list */}
        {!isLoading && !error && schemes.length > 0 && (
          <div className="space-y-4 stagger-children" role="list" aria-label={`${meta.name} schemes`}>
            {schemes.map(scheme => (
              <article key={scheme.id} className="organic-card p-6 flex flex-col gap-4 transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--foreground)]" role="listitem">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-black font-serif text-foreground">{scheme.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mt-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{scheme.ministry}</span>
                    </div>
                  </div>
                  {scheme.submission_url && (
                    <a
                      href={scheme.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 organic-button text-xs shrink-0"
                    >
                      Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed">{scheme.benefits}</p>

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

                {scheme.application_process && scheme.application_process.length > 0 && (
                  <details className="group">
                    <summary className="text-xs font-medium text-primary cursor-pointer hover:underline">
                      View Application Steps
                    </summary>
                    <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside pl-1">
                      {scheme.application_process.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </details>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
