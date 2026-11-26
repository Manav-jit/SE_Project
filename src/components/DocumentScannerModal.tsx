'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Scan, CheckCircle2, ShieldCheck, Loader2, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { parseDocumentImage, ParsedDocumentData } from '@/lib/ocr/parser';
import { UserProfile } from '@/lib/chat/profile';
import { computeNameMatchScore } from '@/lib/ocr/scrutiny';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extracted: Partial<UserProfile>) => void;
}

export function DocumentScannerModal({ isOpen, onClose, onConfirm }: DocumentScannerModalProps) {
  const [, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [extractedData, setExtractedData] = useState<ParsedDocumentData | null>(null);
  
  // Editable fields for citizen verification
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('male');
  const [state, setState] = useState('Uttar Pradesh');
  const [aadhaarLast4, setAadhaarLast4] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    processImage(selectedFile);
  };

  const processImage = async (imgSource: File | string) => {
    setIsProcessing(true);
    setProgress(10);
    setStatusText('Reading document image...');
    setExtractedData(null);

    try {
      const data = await parseDocumentImage(imgSource, (p, status) => {
        setProgress(p);
        setStatusText(status);
      });

      setExtractedData(data);
      setName(data.name || '');
      setAge(data.age || '');
      setGender(data.gender || 'male');
      setState(data.state || 'Uttar Pradesh');
      setAadhaarLast4(data.aadhaarLast4 || '');
    } catch (err) {
      console.error('OCR processing error:', err);
      const fallback: ParsedDocumentData = {
        name: '',
        documentType: 'Identity Document',
        confidence: 0,
        rawText: '',
      };
      setExtractedData(fallback);
      setName('');
      setAge('');
      setGender('male');
      setState('Uttar Pradesh');
      setAadhaarLast4('');
      setStatusText('Text recognition encountered an error. Please fill details manually below.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleUseSampleAadhaar = () => {
    // Generate an authentic synthetic Aadhaar card canvas to test real OCR pipeline
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Card background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 600, 380);
      
      // Top header bar (Tricolor accent)
      ctx.fillStyle = '#FF9933';
      ctx.fillRect(0, 0, 600, 8);
      ctx.fillStyle = '#138808';
      ctx.fillRect(0, 372, 600, 8);

      // Card border
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 592, 372);

      // Text Header
      ctx.fillStyle = '#166534';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Government of India - UIDAI', 150, 40);
      ctx.font = '14px sans-serif';
      ctx.fillText('Unique Identification Authority of India', 160, 60);

      // Photo placeholder
      ctx.fillStyle = '#DCFCE7';
      ctx.fillRect(40, 90, 110, 140);
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 90, 110, 140);
      ctx.fillStyle = '#166534';
      ctx.font = '12px sans-serif';
      ctx.fillText('PHOTO', 75, 165);

      // Resident Information
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Rajesh Sundaram', 180, 120);
      
      ctx.font = '14px sans-serif';
      ctx.fillText('DOB: 15/08/1982', 180, 150);
      ctx.fillText('Gender: Male / पुरुष', 180, 175);
      ctx.fillText('Address: Pune, Maharashtra - 411001', 180, 205);

      // Aadhaar 12-digit number (spaced format)
      ctx.fillStyle = '#0F5132';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('5482 9104 6329', 180, 260);

      ctx.fillStyle = '#666666';
      ctx.font = '12px sans-serif';
      ctx.fillText('mera aadhaar, meri pehchan', 190, 290);

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], 'sample_aadhaar.png', { type: 'image/png' });
          handleFileSelect(sampleFile);
        }
      });
    }
  };

  const handleConfirm = () => {
    const finalProfile: Partial<UserProfile> = {
      name: name.trim(),
      age: typeof age === 'number' ? age : undefined,
      gender,
      state,
      aadhaarLast4: aadhaarLast4.slice(-4),
      verified: true,
    };
    onConfirm(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl organic-card overflow-hidden my-auto bg-card">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-secondary/40">
          <div className="flex items-center gap-2">
            <Scan className="w-6 h-6 text-foreground" />
            <h2 className="font-black font-serif text-xl text-foreground">AI Document Scanner (OCR)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-foreground hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-all text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* File Upload Zone */}
          {!previewUrl ? (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-foreground/30 hover:border-foreground rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/5 transition-all bg-background text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                  <Upload className="w-7 h-7 text-foreground" />
                </div>
                <div>
                  <p className="font-black text-foreground text-sm">Click to upload Aadhaar, Ration Card, or Voter ID</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPEG, WebP (Max 10MB)</p>
                </div>
              </div>

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }} 
              />

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-foreground/15 w-full" />
                <span className="bg-card px-3 text-xs font-black uppercase tracking-wider text-muted-foreground absolute">OR</span>
              </div>

              {/* Sample Aadhaar generator button */}
              <button
                type="button"
                onClick={handleUseSampleAadhaar}
                className="w-full py-3 rounded-xl border-2 border-foreground bg-accent text-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate &amp; Test with Sample Aadhaar Card
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Image Preview & Scanner Visual */}
              <div className="relative rounded-xl border-2 border-foreground overflow-hidden bg-background max-h-52 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Document Preview" className="max-h-52 object-contain w-full" />
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-primary absolute top-0 animate-pulse shadow-[0_0_8px_#16a34a]" />
                    <Loader2 className="w-8 h-8 text-foreground animate-spin mb-2" />
                    <p className="text-xs font-black text-foreground bg-card/90 px-3 py-1 rounded-full border border-foreground shadow-sm">
                      {statusText} ({progress}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Re-upload button */}
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setFile(null);
                  setExtractedData(null);
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
              >
                Upload a different document
              </button>
            </div>
          )}

          {/* Extracted Fields Form */}
          {extractedData && (
            <div className="space-y-4 border-t-2 border-foreground/15 pt-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{extractedData.documentType} Detected ({extractedData.confidence}% Confidence)</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-muted-foreground">Verify details below</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-foreground bg-background text-foreground focus:outline-none"
                    placeholder="Applicant Name"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-foreground">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-foreground bg-background text-foreground focus:outline-none"
                    placeholder="Age in years"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-foreground bg-background text-foreground focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-foreground">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-foreground bg-background text-foreground focus:outline-none"
                    placeholder="State"
                  />
                </div>
              </div>

              {/* Aadhaar Last 4 and Verhoeff Checksum Badge */}
              {aadhaarLast4 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/10 border-2 border-foreground/30 text-xs font-mono font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Aadhaar: XXXX-XXXX-{aadhaarLast4}</span>
                  </div>
                  {extractedData.isVerhoeffValid !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold border ${extractedData.isVerhoeffValid ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-amber-100 border-amber-500 text-amber-800'}`}>
                      {extractedData.isVerhoeffValid ? 'UIDAI Verhoeff: Valid ✓' : 'Checksum: Manual Verification'}
                    </span>
                  )}
                </div>
              )}

              {/* Haqdarshak-Inspired Pre-Scrutiny Check */}
              {name && extractedData?.name && (
                (() => {
                  const check = computeNameMatchScore(name, extractedData.name);
                  return (
                    <div className={`p-2.5 rounded-lg border text-xs font-bold flex items-start gap-2 ${check.status === 'EXACT' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
                      {check.status === 'EXACT' ? <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                      <div>
                        <span className="block font-black text-[10px] uppercase tracking-wider">
                          DBT Pre-Scrutiny ({check.score}% Match)
                        </span>
                        <p className="text-[11px] leading-tight mt-0.5">{check.message}</p>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Confirm & Save Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl border-2 border-foreground bg-primary text-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_var(--foreground)] hover:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-y-[-1px] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Apply Verified Details to Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
