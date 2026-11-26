'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Building2, 
  FileCheck, 
  Sparkles, 
  Download,
  AlertCircle
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus } from '@/lib/storage/applications';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function TrackClient() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'SS-2026-1042';

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [allApplications, setAllApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(initialId));
  const [error, setError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  useEffect(() => {
    // Load all applications for quick suggestions
    fetch('/api/applications')
      .then(r => r.json())
      .then(d => {
        if (d.applications) {
          setAllApplications(d.applications);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchInitial() {
      if (!initialId.trim()) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/applications?id=${encodeURIComponent(initialId.trim())}`);
        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.application) {
            setError(`No application found for Reference ID "${initialId}". Please check the ID or select from recent submissions.`);
            setApplication(null);
          } else {
            setApplication(data.application);
          }
        }
      } catch {
        if (!ignore) setError('Failed to connect to tracking registry. Please try again.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [initialId]);

  const lookupApplication = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      // First try exact ID lookup
      const res = await fetch(`/api/applications?id=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (res.ok && data.application) {
        setApplication(data.application);
        return;
      }

      // Fallback: search by mobile, aadhaar last-4, or applicant name
      const searchRes = await fetch(`/api/applications?query=${encodeURIComponent(id.trim())}`);
      const searchData = await searchRes.json();
      if (searchRes.ok && Array.isArray(searchData.applications) && searchData.applications.length > 0) {
        setApplication(searchData.applications[0]);
      } else {
        setError(`No application found for "${id}". Please check the Reference ID or Mobile Number.`);
        setApplication(null);
      }
    } catch {
      setError('Failed to connect to tracking registry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!application) return;
    setIsDownloadingReceipt(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'receipt',
          applicationId: application.id,
        }),
      });

      if (!res.ok) throw new Error("Could not download receipt");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acknowledgement_${application.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download receipt:', err);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupApplication(searchQuery);
  };

  const handleSimulateAdvance = async () => {
    if (!application) return;
    setIsAdvancing(true);

    const statusFlow: ApplicationStatus[] = [
      'SUBMITTED',
      'UNDER_VERIFICATION',
      'FIELD_INSPECTION',
      'SANCTIONED',
      'DISBURSED'
    ];

    const currentIndex = statusFlow.indexOf(application.status);
    const nextStatus = statusFlow[Math.min(currentIndex + 1, statusFlow.length - 1)];

    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: application.id,
          status: nextStatus,
          remark: `Stage advanced successfully by District Nodal Officer on ${new Date().toLocaleDateString('en-IN')}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setApplication(data.application);
          // Also update local list
          setAllApplications(prev => prev.map(a => a.id === data.application.id ? data.application : a));
        }
      }
    } catch (err) {
      console.error('Failed to simulate advance:', err);
    } finally {
      setIsAdvancing(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'DISBURSED':
      case 'SANCTIONED':
        return 'bg-emerald-100 border-emerald-600 text-emerald-900';
      case 'FIELD_INSPECTION':
      case 'UNDER_VERIFICATION':
        return 'bg-amber-100 border-amber-600 text-amber-900';
      default:
        return 'bg-blue-100 border-blue-600 text-blue-900';
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link href="/dashboard" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Saved Schemes
          </Link>
          <Link href="/chat" className="text-xs px-4 py-2 organic-button">
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-foreground bg-primary/20 text-xs font-black uppercase tracking-wider">
          <FileCheck className="w-4 h-4 text-primary" />
          Citizen Status Portal
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-foreground">
          Track Welfare Application
        </h1>
        <p className="text-sm font-bold text-muted-foreground max-w-xl">
          Enter your Application Reference Number (e.g. SS-2026-1042) to check verification progress, officer remarks, and DBT disbursement timeline.
        </p>
      </div>

      {/* Search Input Card */}
      <form onSubmit={handleSearchSubmit} className="mb-8 p-3 rounded-2xl organic-card bg-card flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 px-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Application Reference ID (e.g. SS-2026-1042)"
            className="w-full bg-transparent border-none outline-none text-sm font-black text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="organic-button px-6 py-3 text-xs uppercase tracking-wider font-black flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Track Application'}
        </button>
      </form>

      {/* Quick Select demo pills */}
      {allApplications.length > 0 && (
        <div className="mb-8 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Recent Submissions:</span>
          {allApplications.slice(0, 4).map(app => (
            <button
              key={app.id}
              onClick={() => {
                setSearchQuery(app.id);
                lookupApplication(app.id);
              }}
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border-2 transition-all ${application?.id === app.id ? 'border-foreground bg-primary text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]' : 'border-foreground/30 bg-card hover:border-foreground'}`}
            >
              {app.id} • {app.schemeId.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl organic-card bg-red-50 border-red-500 mb-8 flex items-start gap-3 text-red-900">
          <AlertCircle className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-black text-sm">Application Not Found</p>
            <p className="text-xs font-bold mt-1 text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Application Details & Milestones */}
      {application && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Summary Card */}
          <div className="organic-card p-6 md:p-8 bg-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-foreground/15 pb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-sm font-mono font-black text-primary bg-primary/20 px-2.5 py-0.5 rounded border border-foreground/30">
                    {application.id}
                  </span>
                  <span className={`text-xs font-black uppercase px-3 py-0.5 rounded-full border-2 ${getStatusBadge(application.status)}`}>
                    {application.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-2xl font-black font-serif text-foreground">{application.schemeName}</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1">
                  Submitted on {new Date(application.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Action Buttons: Download Receipt & Advance Stage */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="px-4 py-2 rounded-xl border-2 border-foreground bg-primary text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingReceipt ? 'Generating Receipt...' : 'Download Official Receipt (PDF)'}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateAdvance}
                  disabled={isAdvancing || application.status === 'DISBURSED'}
                  className="px-4 py-2 rounded-xl border-2 border-foreground bg-accent text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAdvancing ? 'Advancing Stage...' : application.status === 'DISBURSED' ? 'Fully Disbursed' : 'Advance Stage'}
                </button>
              </div>
            </div>

            {/* Credential Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
              <div className="p-3 rounded-xl bg-background border border-foreground/20">
                <span className="text-[10px] text-muted-foreground uppercase block">Applicant</span>
                <span className="font-black text-foreground">{application.applicantName}</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-foreground/20">
                <span className="text-[10px] text-muted-foreground uppercase block">State / Region</span>
                <span className="font-black text-foreground">{application.state}</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-foreground/20">
                <span className="text-[10px] text-muted-foreground uppercase block">Submission Center</span>
                <span className="font-black text-foreground truncate block">{application.cscCenter || 'Central Portal'}</span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-foreground/20">
                <span className="text-[10px] text-muted-foreground uppercase block">Approved Entitlement</span>
                <span className="font-black text-emerald-800 truncate block">{application.sanctionedAmount || 'As per norms'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="organic-card p-6 md:p-8 bg-card space-y-6">
            <h3 className="text-xl font-black font-serif text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Statutory Verification Timeline
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:top-3 before:h-[90%] before:w-0.5 before:bg-foreground/20">
              {application.trackingMilestones.map((m, idx) => {
                const isDone = m.status === 'COMPLETED';
                const isCurrent = m.status === 'IN_PROGRESS';

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Icon */}
                    <div className={`w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 z-10 transition-all ${isDone ? 'bg-primary text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]' : isCurrent ? 'bg-accent text-foreground animate-pulse shadow-[2px_2px_0px_0px_var(--foreground)]' : 'bg-background text-muted-foreground'}`}>
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCurrent ? (
                        <CircleDot className="w-5 h-5 text-foreground" />
                      ) : (
                        <span className="font-mono font-black text-xs">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className={`flex-1 p-4 rounded-xl border-2 transition-all ${isDone ? 'border-foreground/30 bg-secondary/40' : isCurrent ? 'border-foreground bg-accent/10 shadow-[3px_3px_0px_0px_var(--foreground)]' : 'border-foreground/15 bg-background opacity-60'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-black text-sm text-foreground">{m.stage}</span>
                        {m.timestamp && (
                          <span className="text-[11px] font-mono font-bold text-muted-foreground">
                            {new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{m.description}</p>
                      {m.officerRemark && (
                        <div className="mt-2 text-xs font-bold text-foreground/90 p-2 rounded bg-background border border-foreground/15 flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>Officer Remark: {m.officerRemark}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-6 rounded-2xl organic-card bg-primary/10 border-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-sm text-foreground">Need a physical copy of your Application Receipt?</p>
              <p className="text-xs font-bold text-muted-foreground">Contains submission date, officer seal, and official QR verification code.</p>
            </div>
            <Link 
              href={`/api/generate-pdf`} 
              onClick={(e) => {
                e.preventDefault();
                window.print();
              }}
              className="px-5 py-2.5 rounded-full border-2 border-foreground bg-card text-foreground text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[4px_4px_0px_0px_var(--foreground)] shrink-0 transition-all"
            >
              <Download className="w-4 h-4" />
              Print Official Receipt
            </Link>
          </div>

        </div>
      )}

    </main>
  );
}
