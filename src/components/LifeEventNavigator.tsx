'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Baby, Sprout, GraduationCap, HeartHandshake, Hammer, 
  ArrowRight, Sparkles, ShieldCheck 
} from 'lucide-react';
import { LIFE_EVENT_BUNDLES, LifeEventBundle } from '@/lib/schemes/lifeEvents';
import { saveStoredProfile, getStoredProfile } from '@/lib/chat/profile';
import { useLanguage } from '@/lib/i18n/context';

export function LifeEventNavigator() {
  const router = useRouter();
  const { language } = useLanguage();

  const handleSelectMilestone = (bundle: LifeEventBundle) => {
    const current = getStoredProfile();
    const merged = { ...current, ...bundle.targetProfile };
    saveStoredProfile(merged);
    const prompt = `I am experiencing a milestone life event: ${bundle.title}. Please evaluate my family eligibility for this statutory bundle (${bundle.packageTotalValue}).`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const getIcon = (type: LifeEventBundle['iconType']) => {
    switch (type) {
      case 'baby':
        return <Baby className="w-5 h-5 text-[#BE185D]" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-[#15803D]" />;
      case 'graduation':
        return <GraduationCap className="w-5 h-5 text-[#1D4ED8]" />;
      case 'senior':
        return <HeartHandshake className="w-5 h-5 text-[#7E22CE]" />;
      case 'artisan':
        return <Hammer className="w-5 h-5 text-[#B45309]" />;
    }
  };

  return (
    <section aria-label="Life-Event Entitlement Navigator" className="w-full mb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Inspired by e-Estonia Proactive Welfare Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-foreground">
            {language === 'hi' ? 'जीवन के मुख्य पड़ाव अनुसार योजनाएं' : 'Explore by Life Milestone'}
          </h2>
        </div>
        <p className="text-xs font-bold text-muted-foreground max-w-sm">
          {language === 'hi' 
            ? 'विभिन्न मंत्रालयों की योजनाओं को एक साथ बंडल करके 1-क्लिक में पूरे परिवार के लिए खोजें।'
            : 'Pre-bundled cross-ministry entitlements triggered by major human life milestones.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIFE_EVENT_BUNDLES.map((bundle) => {
          const isHi = language === 'hi';
          return (
            <div
              key={bundle.id}
              onClick={() => handleSelectMilestone(bundle)}
              className="group cursor-pointer rounded-2xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-[6px_6px_0px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
              style={{ backgroundColor: bundle.colorBg }}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl border border-foreground/30 bg-white/90 flex items-center justify-center shadow-[1px_1px_0px_0px_var(--foreground)]">
                    {getIcon(bundle.iconType)}
                  </div>
                  <span className="font-mono text-[11px] font-black px-2.5 py-0.5 rounded-full bg-white/95 border border-foreground/30 text-foreground shadow-sm">
                    {bundle.packageTotalValue}
                  </span>
                </div>

                <h3 className="font-serif font-black text-lg text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
                  {isHi ? bundle.hindiTitle : bundle.title}
                </h3>
                
                <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-4">
                  {isHi ? bundle.hindiTagline : bundle.tagline}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-foreground/15 flex items-center justify-between text-xs font-black">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  {bundle.schemeIds.length} Schemes Linked
                </span>
                <span className="flex items-center gap-1 text-foreground group-hover:gap-2 transition-all">
                  <span>Diagnose</span>
                  <ArrowRight className="w-3.5 h-3.5 text-foreground" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
