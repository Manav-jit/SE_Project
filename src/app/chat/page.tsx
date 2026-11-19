'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, ShieldAlert, ShieldCheck, Globe, Volume2, VolumeX, X } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SchemeCard } from '@/components/SchemeCard';
import { DigiLockerModal } from '@/components/DigiLockerModal';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { ProofGraphModal } from '@/components/dag/ProofGraphModal';
import { DocumentScannerModal } from '@/components/DocumentScannerModal';
import { UserProfile, getStoredProfile, saveStoredProfile, PROFILE_EVENT } from '@/lib/chat/profile';
import { Scheme } from '@/lib/schemes/loader';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function ChatPage() {
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  // Modals state
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState<Scheme | null>(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<Scheme | null>(null);
  const [selectedSchemeForProof, setSelectedSchemeForProof] = useState<Scheme | null>(null);
  
  // New features state
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [hasSkippedStateSelection, setHasSkippedStateSelection] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!getStoredProfile().state;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const lastSpokenMessageRef = useRef<string>('');

  // Listen for storage updates
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      const updated = customEvent.detail || getStoredProfile();
      if (updated) setProfile(updated);
    };

    window.addEventListener(PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener(PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const updateAndSaveProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setProfile(prev => {
      const next = updater(prev);
      saveStoredProfile(next);
      return next;
    });
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          profile: getStoredProfile(),
          language: (typeof window !== 'undefined' ? localStorage.getItem('schemesaathi_lang') : null) || 'en',
        }),
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          const updatedProfileStr = response.headers.get('x-updated-profile');
          if (updatedProfileStr) {
            try {
              const updated = JSON.parse(updatedProfileStr);
              setProfile(prev => {
                const merged = { ...prev, ...updated };
                saveStoredProfile(merged);
                return merged;
              });
            } catch (err) {
              console.error('Failed to parse updated profile', err);
            }
          }

          const matchedSchemesStr = response.headers.get('x-matched-schemes');
          if (matchedSchemesStr) {
            try {
              setMatchedSchemes(JSON.parse(decodeURIComponent(matchedSchemesStr)));
            } catch (err) {
              console.error('Failed to parse matched schemes', err);
            }
          }

          return response;
        },
      }),
    []
  );

  const { messages, sendMessage, status, clearError } = useChat<UIMessage>({
    transport,
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: "Namaste! I'm SchemeSaathi. I can help you find government welfare schemes you're eligible for. To get started, could you tell me a little about yourself, like your age and occupation?",
          },
        ],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Handle Text-to-Speech
  useEffect(() => {
    if (!voiceOutputEnabled || isLoading || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.id !== lastSpokenMessageRef.current) {
      lastSpokenMessageRef.current = lastMessage.id;
      const utterance = new SpeechSynthesisUtterance(getMessageText(lastMessage));
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, isLoading, voiceOutputEnabled, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    clearError();
    sendMessage({ text: input });
    setInput('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerateForm = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForAction(scheme);
    }
  };

  const handleViewDetails = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForDetails(scheme);
    }
  };

  const handleVerifyProof = (schemeId: string) => {
    const scheme = matchedSchemes.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedSchemeForProof(scheme);
    }
  };

  const handleDigiLockerVerify = (verifiedData: Partial<UserProfile>) => {
    updateAndSaveProfile(prev => ({ ...prev, ...verifiedData }));
    clearError();
    sendMessage({
      text: 'My DigiLocker profile has been successfully connected and verified. Please use the verified details from my updated profile.',
    });
  };

  const handleFileUpload = () => {
    setIsScannerOpen(true);
  };

  const handleScannerConfirm = (extractedData: Partial<UserProfile>) => {
    updateAndSaveProfile(prev => ({ ...prev, ...extractedData }));
    clearError();
    sendMessage({
      text: `Document scanned successfully via AI OCR. Extracted details: Name: ${extractedData.name || 'Verified Citizen'}, Age: ${extractedData.age || 'Verified'}, Gender: ${extractedData.gender || 'Verified'}, State: ${extractedData.state || 'Verified'}. These details have been confirmed and applied to my profile.`,
    });
  };

  // Reusable Sidebar Content
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
            className={`p-2 rounded-lg border-2 transition-colors ${voiceOutputEnabled ? 'bg-primary border-foreground text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]' : 'border-card-border/40 text-muted-foreground hover:bg-card/50'}`}
            title="Toggle Voice Output"
          >
            {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 rounded-lg border-2 border-foreground bg-card text-xs font-black text-foreground shadow-[2px_2px_0px_0px_var(--foreground)] transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'English' : 'हिंदी'}
          </button>
        </div>
      </div>

      <div className="mb-6 animate-fade-in">
        <h2 className="text-xl font-black font-serif flex items-center gap-2 mb-4 text-foreground">
          <UserIcon className="w-5 h-5 text-primary" />
          Your Profile
        </h2>
        
        <div className="space-y-3 text-sm">
          {Object.keys(profile).length === 0 ? (
            <p className="text-muted-foreground font-medium italic">Tell me about yourself in the chat to build your profile.</p>
          ) : (
            <div className="grid gap-2">
              {Object.entries(profile).map(([key, value]) => {
                if (!value || key === 'verified') return null;
                return (
                  <div key={key} className="flex flex-col bg-[#F9FFF4] p-2.5 rounded-lg border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                    <span className="text-muted-foreground capitalize text-[10px] font-black uppercase tracking-wider">{key}</span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-sm mt-0.5">
                      {String(value)}
                      {profile.verified && ['name', 'age', 'gender', 'state'].includes(key) && (
                        <span title="Verified Data"><ShieldCheck className="w-4 h-4 text-green-600" /></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {matchedSchemes.length > 0 && (
        <div className="mt-4 pt-6 border-t-2 border-foreground/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black font-serif text-foreground">Matched Schemes</h2>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-primary border border-foreground">{matchedSchemes.length}</span>
          </div>
          <div className="space-y-4">
            {matchedSchemes.map(scheme => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                profile={profile}
                onGenerateForm={handleGenerateForm} 
                onViewDetails={handleViewDetails}
                onVerifyProof={handleVerifyProof}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-6 flex flex-col gap-4">
        {!profile.verified && (
          <button 
            onClick={() => setIsDigiLockerOpen(true)}
            className="w-full py-3 organic-button flex items-center justify-center gap-2 text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Connect DigiLocker
          </button>
        )}

        <div className="bg-[#FFE5B4] border-2 border-foreground rounded-[12px] p-3 text-xs font-bold text-foreground shadow-[3px_3px_0px_0px_var(--foreground)] flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p>Your data is processed securely and is not stored permanently. Mock DigiLocker integration active.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background bg-dot-pattern relative">
      
      {/* State Selector Modal */}
      {(!profile.state && !hasSkippedStateSelection) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="organic-card p-6 w-full max-w-md flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Select your State</h3>
              <button onClick={() => setHasSkippedStateSelection(true)} className="p-1 hover:bg-card-border rounded-lg text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">This helps us find schemes specific to your region.</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
              {indianStates.map(st => (
                <button
                  key={st}
                  onClick={() => {
                    updateAndSaveProfile(prev => ({ ...prev, state: st }));
                    setHasSkippedStateSelection(true);
                  }}
                  className="px-3 py-2 text-left text-sm rounded-lg hover:bg-primary/20 hover:text-primary transition-colors border border-card-border"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <DigiLockerModal 
        isOpen={isDigiLockerOpen} 
        onClose={() => setIsDigiLockerOpen(false)} 
        onVerify={handleDigiLockerVerify} 
      />
      <ActionPlanModal 
        isOpen={!!selectedSchemeForAction}
        onClose={() => setSelectedSchemeForAction(null)}
        scheme={selectedSchemeForAction}
        profile={profile}
        onVerifyProof={(scheme) => setSelectedSchemeForProof(scheme)}
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
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onConfirm={handleScannerConfirm}
      />

      {/* Mobile Drawer (Slide-Over) */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-card border-r-2 border-foreground p-6 overflow-y-auto z-10 flex flex-col shadow-[6px_0px_0px_0px_var(--foreground)] animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black font-serif text-lg text-foreground">SchemeSaathi</span>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg border-2 border-foreground bg-primary text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}
      
      {/* Desktop Sidebar - Profile Summary */}
      <div className="hidden md:flex w-80 flex-col border-r-2 border-foreground bg-card/60 p-6 overflow-y-auto">
        {renderSidebarContent()}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3.5 border-b-2 border-foreground bg-background/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-foreground p-1.5 rounded-lg border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_var(--foreground)]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-black font-serif text-foreground text-sm">SchemeSaathi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="px-2.5 py-1.5 rounded-full border-2 border-foreground bg-primary text-foreground text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_var(--foreground)]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile {matchedSchemes.length > 0 && `(${matchedSchemes.length})`}</span>
            </button>
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className="px-2 py-1 rounded-lg border-2 border-foreground bg-card text-xs font-black text-foreground shadow-[2px_2px_0px_0px_var(--foreground)]"
            >
              {language === 'en' ? 'EN' : 'HI'}
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="bg-[#F9FFF4] border-2 border-foreground rounded-[16px] rounded-tl-[4px] shadow-[4px_4px_0px_0px_var(--foreground)] p-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-8 pt-0 bg-gradient-to-t from-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput 
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onFileUpload={handleFileUpload}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
