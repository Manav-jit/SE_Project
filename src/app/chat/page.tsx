'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, ShieldAlert, ShieldCheck, Globe, Volume2, VolumeX, Scan, X } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SchemeCard } from '@/components/SchemeCard';
import { DigiLockerModal } from '@/components/DigiLockerModal';
import { ActionPlanModal } from '@/components/ActionPlanModal';
import { SchemeDetailModal } from '@/components/SchemeDetailModal';
import { UserProfile } from '@/lib/chat/profile';
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
  const [profile, setProfile] = useState<UserProfile>({});
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  
  // Modals state
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState<Scheme | null>(null);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<Scheme | null>(null);
  
  // New features state
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasSkippedStateSelection, setHasSkippedStateSelection] = useState(false);

  const lastSpokenMessageRef = useRef<string>('');
  const profileRef = useRef(profile);
  const languageRef = useRef(language);
  profileRef.current = profile;
  languageRef.current = language;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          profile: profileRef.current,
          language: languageRef.current,
        }),
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          const updatedProfileStr = response.headers.get('x-updated-profile');
          if (updatedProfileStr) {
            try {
              setProfile(JSON.parse(updatedProfileStr));
            } catch (e) {
              console.error('Failed to parse updated profile', e);
            }
          }

          const matchedSchemesStr = response.headers.get('x-matched-schemes');
          if (matchedSchemesStr) {
            try {
              setMatchedSchemes(JSON.parse(decodeURIComponent(matchedSchemesStr)));
            } catch (e) {
              console.error('Failed to parse matched schemes', e);
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

  const handleDigiLockerVerify = (verifiedData: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...verifiedData }));
    clearError();
    sendMessage({
      text: 'My DigiLocker profile has been successfully connected and verified. Please use the verified details from my updated profile.',
    });
  };

  const handleFileUpload = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const extractedData = {
        name: "Ramesh Kumar",
        age: 45,
        gender: "male",
        state: profile.state || "Maharashtra",
        verified: true
      };
      setProfile(prev => ({ ...prev, ...extractedData }));
      clearError();
      sendMessage({
        text: `Document scanned successfully. Extracted details: Name: ${extractedData.name}, Age: ${extractedData.age}. These have been verified.`,
      });
    }, 2500);
  };

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
                    setProfile(prev => ({ ...prev, state: st }));
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

      {/* OCR Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="organic-card p-8 flex flex-col items-center gap-6">
            <div className="relative">
              <Scan className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Scanning Document...</h3>
              <p className="text-sm text-muted-foreground">Extracting your details securely</p>
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
      />
      <SchemeDetailModal
        isOpen={!!selectedSchemeForDetails}
        onClose={() => setSelectedSchemeForDetails(null)}
        scheme={selectedSchemeForDetails}
      />
      
      {/* Sidebar - Profile Summary */}
      <div className="hidden md:flex w-80 flex-col border-r border-card-border bg-card/30 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className={`p-2 rounded-lg border transition-colors ${voiceOutputEnabled ? 'bg-primary/20 border-primary/50 text-primary' : 'border-card-border text-muted-foreground hover:bg-card/50'}`}
              title="Toggle Voice Output"
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-lg border border-card-border text-xs font-medium text-foreground hover:bg-card/50 transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'English' : 'हिंदी'}
            </button>
          </div>
        </div>

        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-black font-serif flex items-center gap-2 mb-4 text-foreground">
            <UserIcon className="w-5 h-5 text-primary" />
            Your Profile
          </h2>
          
          <div className="space-y-3 text-sm">
            {Object.keys(profile).length === 0 ? (
              <p className="text-muted-foreground italic">Tell me about yourself in the chat to build your profile.</p>
            ) : (
              <div className="grid gap-2">
                {Object.entries(profile).map(([key, value]) => {
                  if (!value || key === 'verified') return null;
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-muted-foreground capitalize text-xs">{key}</span>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        {value}
                        {profile.verified && ['name', 'age', 'gender', 'state'].includes(key) && (
                          <span title="Verified Data"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /></span>
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
          <div className="mt-8 pt-8 border-t border-card-border animate-fade-in">
            <h2 className="text-xl font-black font-serif mb-4 text-foreground">Matched Schemes</h2>
            <div className="space-y-4">
              {matchedSchemes.map(scheme => (
                <SchemeCard 
                  key={scheme.id} 
                  scheme={scheme} 
                  profile={profile}
                  onGenerateForm={handleGenerateForm} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-8 flex flex-col gap-4">
          {!profile.verified && (
            <button 
              onClick={() => setIsDigiLockerOpen(true)}
              className="w-full py-3 organic-button flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Connect DigiLocker
            </button>
          )}

          <div className="bg-[#FFE5B4] border-2 border-foreground rounded-[12px] p-4 text-xs font-bold text-foreground shadow-[3px_3px_0px_0px_var(--foreground)] flex items-start gap-2 mt-4">
            <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p>Your data is processed securely and is not stored permanently. Mock DigiLocker integration active.</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-card-border bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-semibold text-foreground">SchemeSaathi</span>
          </div>
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 rounded-lg border border-card-border text-xs font-medium text-foreground hover:bg-card/50 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'EN' : 'HI'}
          </button>
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
