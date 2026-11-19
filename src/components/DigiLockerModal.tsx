'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle2, FileCheck, ArrowRight, Smartphone, KeyRound, CheckSquare, Square } from 'lucide-react';
import { UserProfile } from '@/lib/chat/profile';

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: Partial<UserProfile>) => void;
}

type EkycStep = 'credentials' | 'otp' | 'consent' | 'verifying' | 'success';

interface DigiDoc {
  id: string;
  name: string;
  issuer: string;
  docNumber: string;
  selected: boolean;
}

export function DigiLockerModal({ isOpen, onClose, onVerify }: DigiLockerModalProps) {
  const [step, setStep] = useState<EkycStep>('credentials');
  const [identifier, setIdentifier] = useState('9876543210');
  const [securityPin, setSecurityPin] = useState('123456');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const [errorMsg, setErrorMsg] = useState('');

  // Consent Documents
  const [documents, setDocuments] = useState<DigiDoc[]>([
    { id: 'aadhaar', name: 'Aadhaar Card', issuer: 'UIDAI', docNumber: 'XXXXXXXX4892', selected: true },
    { id: 'ration', name: 'Ration Card (NFSA)', issuer: 'Food & Civil Supplies Dept', docNumber: 'RC-992014-MH', selected: true },
    { id: 'income', name: 'Income Certificate', issuer: 'Revenue Department', docNumber: 'INC/2026/04192', selected: true },
    { id: 'domicile', name: 'Domicile / Caste Certificate', issuer: 'Tahsildar Office', docNumber: 'DOM-782190', selected: false },
  ]);

  // Verified Data Preview
  const [verifiedData] = useState<Partial<UserProfile>>({
    name: "Rameshwar Singh",
    age: 44,
    gender: "male",
    state: "Uttar Pradesh",
    aadhaarLast4: "4892",
    mobile: "9876543210",
    verified: true,
    digilockerId: "DL-IND-2026-98124",
    verifiedDocuments: ["Aadhaar Card (UIDAI)", "Ration Card (NFSA)", "Income Certificate"],
  });

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (identifier.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile or 12-digit Aadhaar number');
      return;
    }
    if (securityPin.length < 6) {
      setErrorMsg('PIN must be 6 digits');
      return;
    }
    setStep('otp');
    setTimer(45);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp !== '839201' && otp.length !== 6) {
      setErrorMsg('Invalid OTP. Please enter the 6-digit code or click Auto-fill.');
      return;
    }
    setStep('consent');
  };

  const toggleDoc = (id: string) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  };

  const handleConsentSubmit = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
    }, 1800);
  };

  const handleFinalConfirm = () => {
    const selectedDocNames = documents.filter(d => d.selected).map(d => `${d.name} (${d.issuer})`);
    onVerify({
      ...verifiedData,
      verifiedDocuments: selectedDocNames,
    });
    setStep('credentials');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg organic-card overflow-hidden my-auto bg-card shadow-[8px_8px_0px_0px_var(--foreground)]">
        
        {/* Header with DigiLocker Official Identity */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-[#F9FFF4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
              <ShieldCheck className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <span className="font-black font-serif text-xl text-foreground block leading-tight">DigiLocker</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Digital India • Verified Citizen Service</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-background border-b-2 border-foreground text-[11px] font-black uppercase tracking-wider">
          <span className={step === 'credentials' ? 'text-primary underline' : 'text-muted-foreground'}>1. Login</span>
          <span>→</span>
          <span className={step === 'otp' ? 'text-primary underline' : 'text-muted-foreground'}>2. OTP</span>
          <span>→</span>
          <span className={step === 'consent' ? 'text-primary underline' : 'text-muted-foreground'}>3. Documents</span>
          <span>→</span>
          <span className={step === 'success' ? 'text-primary underline' : 'text-muted-foreground'}>4. Verified</span>
        </div>

        {/* Content */}
        <div className="p-6 bg-card space-y-5">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-100 border-2 border-red-500 text-red-900 text-xs font-bold animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <form onSubmit={handleStep1Submit} className="space-y-4 animate-fade-in">
              <p className="text-xs font-bold text-muted-foreground">
                Connect your Government of India DigiLocker account to automatically verify your demographic credentials and unlock verified scheme eligibility.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile / Aadhaar Number
                </label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter 10-digit mobile or 12-digit Aadhaar"
                  className="w-full bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] rounded-lg p-3 text-xs font-bold outline-none focus:translate-y-[-1px] transition-all"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  6-Digit DigiLocker Security PIN
                </label>
                <input 
                  type="password" 
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className="w-full bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)] rounded-lg p-3 text-xs font-bold outline-none focus:translate-y-[-1px] transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full organic-button py-3 mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                Proceed to Secure Verification
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-center font-bold text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>256-bit encrypted sandbox • UIDAI &amp; MeitY compliance</span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-foreground">One-Time Password (OTP) Sent</p>
                <p className="text-xs font-bold text-muted-foreground">
                  A 6-digit OTP has been sent to your registered mobile ending in <strong>{identifier.slice(-4)}</strong>.
                </p>
              </div>

              {/* Convenience Auto-fill Pill */}
              <button
                type="button"
                onClick={() => setOtp('839201')}
                className="w-full py-2 rounded-lg border border-dashed border-emerald-600 bg-emerald-50 text-emerald-900 text-xs font-mono font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <span>🔑 Simulated OTP: <strong>839201</strong> (Click to Auto-fill)</span>
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-foreground">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full bg-background border-2 border-foreground text-center tracking-[0.5em] shadow-[2px_2px_0px_0px_var(--foreground)] rounded-lg p-3 text-lg font-mono font-black outline-none focus:translate-y-[-1px] transition-all"
                  required
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>{timer > 0 ? `Resend OTP in ${timer}s` : 'Did not receive OTP?'}</span>
                {timer === 0 && (
                  <button type="button" onClick={() => setTimer(45)} className="text-primary font-black underline">
                    Resend OTP
                  </button>
                )}
              </div>

              <button 
                type="submit"
                className="w-full organic-button py-3 mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                Validate OTP &amp; Fetch Documents
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: DOCUMENT SELECTION & CONSENT */}
          {step === 'consent' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground">Select Documents to Share</p>
                <p className="text-xs font-bold text-muted-foreground">
                  The following authenticated documents were found in your DigiLocker. Choose which ones to link:
                </p>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${doc.selected ? 'border-foreground bg-primary/10 shadow-[2px_2px_0px_0px_var(--foreground)]' : 'border-foreground/20 bg-background opacity-60'}`}
                  >
                    <div className="flex items-center gap-3">
                      {doc.selected ? (
                        <CheckSquare className="w-5 h-5 text-foreground shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-black text-foreground">{doc.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{doc.issuer} • {doc.docNumber}</p>
                      </div>
                    </div>
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-background border border-foreground/20 text-[11px] font-bold text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  I grant consent to fetch my verified demographic and income credentials for automated welfare scheme evaluation under Digital India standards.
                </span>
              </div>

              <button 
                type="button"
                onClick={handleConsentSubmit}
                className="w-full organic-button py-3 mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                Authorize &amp; Synchronize Credentials
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* VERIFYING SPINNER */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-fade-in text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="space-y-1">
                <p className="text-base font-black font-serif text-foreground">Cryptographically Verifying Credentials...</p>
                <p className="text-xs font-bold text-muted-foreground">Issuing DigiLocker eKYC Attestation Token</p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS SUMMARY */}
          {step === 'success' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl border-2 border-foreground bg-[#F9FFF4] shadow-[4px_4px_0px_0px_var(--foreground)] space-y-3">
                <div className="flex items-center justify-between border-b border-foreground/15 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">eKYC Verified Citizen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{verifiedData.digilockerId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Name</span>
                    <span className="text-foreground font-black">{verifiedData.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Age / Gender</span>
                    <span className="text-foreground">{verifiedData.age} yrs • {verifiedData.gender}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Domicile State</span>
                    <span className="text-foreground">{verifiedData.state}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Aadhaar (Last 4)</span>
                    <span className="text-foreground font-mono">XXXX-XXXX-{verifiedData.aadhaarLast4}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-foreground/15">
                  <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Linked Verified Documents</span>
                  <div className="flex flex-wrap gap-1.5">
                    {documents.filter(d => d.selected).map(d => (
                      <span key={d.id} className="text-[10px] font-bold bg-primary/20 text-foreground px-2 py-0.5 rounded border border-foreground/30">
                        ✓ {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleFinalConfirm}
                className="w-full organic-button py-3 mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider"
              >
                Apply Verified Profile to Session
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
