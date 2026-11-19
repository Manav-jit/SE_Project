'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Eye, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function AccessibilityToolbar() {
  const { language, setLanguage } = useLanguage();
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>(() => {
    if (typeof window === 'undefined') return 'md';
    return (localStorage.getItem('schemesaathi_font_scale') as 'sm' | 'md' | 'lg') || 'md';
  });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('schemesaathi_contrast') === 'high';
  });
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-scale', fontScale);
    if (isHighContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [fontScale, isHighContrast]);

  const handleFontScale = (scale: 'sm' | 'md' | 'lg') => {
    setFontScale(scale);
    localStorage.setItem('schemesaathi_font_scale', scale);
  };

  const handleToggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      localStorage.setItem('schemesaathi_contrast', 'high');
    } else {
      localStorage.removeItem('schemesaathi_contrast');
    }
  };

  const handleReadPage = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
    const cleanText = mainContent.replace(/\s+/g, ' ').slice(0, 500); // Read introductory passage
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);
    
    setIsReadingAloud(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <aside 
      aria-label="National Accessibility & Language Toolbar"
      className="w-full bg-[#1F3318] text-[#F5F3E7] text-[11px] font-bold py-1 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-foreground/30 z-30"
    >
      {/* Sovereign DPI Label */}
      <div className="flex items-center gap-2 tracking-wider">
        <Shield className="w-3.5 h-3.5 text-[#9CD869]" />
        <span className="uppercase text-[10px] sm:text-[11px] opacity-90">
          Digital Public Infrastructure · Govt. of India Gazette Aligned
        </span>
      </div>

      {/* Accessibility & Language Controls */}
      <div className="flex items-center gap-3 ml-auto">
        
        {/* Read-Aloud Audio */}
        <button
          type="button"
          onClick={handleReadPage}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${isReadingAloud ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10 text-[#F5F3E7]'}`}
          title="Listen to page (Suniye)"
          aria-label={isReadingAloud ? 'Stop audio' : 'Listen to page summary'}
        >
          {isReadingAloud ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          <span className="hidden sm:inline">{isReadingAloud ? 'Stop' : 'Listen'}</span>
        </button>

        <span className="opacity-30">|</span>

        {/* Font Size Scaling (GIGW standard) */}
        <div className="flex items-center gap-1" role="group" aria-label="Text sizing">
          <button
            type="button"
            onClick={() => handleFontScale('sm')}
            className={`px-1.5 py-0.5 rounded text-[10px] ${fontScale === 'sm' ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10'}`}
            title="Smaller text"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => handleFontScale('md')}
            className={`px-1.5 py-0.5 rounded text-[11px] ${fontScale === 'md' ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10'}`}
            title="Normal text"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => handleFontScale('lg')}
            className={`px-1.5 py-0.5 rounded text-[12px] font-black ${fontScale === 'lg' ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10'}`}
            title="Larger text"
          >
            A+
          </button>
        </div>

        <span className="opacity-30">|</span>

        {/* High Contrast Mode Toggle */}
        <button
          type="button"
          onClick={handleToggleContrast}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${isHighContrast ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}
          title="Toggle High-Contrast mode"
          aria-label="Toggle high contrast accessibility view"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">Contrast</span>
        </button>

        <span className="opacity-30">|</span>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded transition-colors ${language === 'en' ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10'}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-1.5 py-0.5 rounded transition-colors ${language === 'hi' ? 'bg-[#9CD869] text-[#1F3318]' : 'hover:bg-white/10'}`}
          >
            हिन्दी
          </button>
        </div>

      </div>
    </aside>
  );
}
