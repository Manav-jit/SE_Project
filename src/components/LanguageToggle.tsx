'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`px-3 py-1.5 rounded-full border-2 border-foreground bg-card text-foreground font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all cursor-pointer ${className || ''}`}
      title="Toggle Language / भाषा बदलें"
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span>{language === 'en' ? 'English • EN' : 'हिंदी • HI'}</span>
    </button>
  );
}
