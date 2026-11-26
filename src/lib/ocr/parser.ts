import { createWorker } from 'tesseract.js';

export interface ParsedDocumentData {
  name?: string;
  age?: number;
  gender?: string;
  state?: string;
  pincode?: string;
  aadhaarNumber?: string;
  aadhaarLast4?: string;
  isVerhoeffValid?: boolean;
  documentType: 'Aadhaar Card' | 'Ration Card' | 'Voter ID' | 'Income Certificate' | 'PAN Card' | 'Identity Document';
  confidence: number;
  rawText: string;
}

// Official Verhoeff multiplication, permutation, and inverse tables
const VERHOEFF_D: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const VERHOEFF_P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const VERHOEFF_INV: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff checksum algorithm (used by UIDAI Aadhaar)
 */
export function validateVerhoeff(numStr: string): boolean {
  const clean = numStr.replace(/\s+/g, '');
  if (!/^\d+$/.test(clean) || clean.length < 2) return false;
  let c = 0;
  const invertedArray = clean.split('').map(Number).reverse();
  for (let i = 0; i < invertedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][invertedArray[i]]];
  }
  return c === 0;
}

/**
 * Generates the Verhoeff check digit for an 11-digit base number to form a valid 12-digit Aadhaar
 */
export function generateVerhoeffCheckDigit(numStr: string): string {
  const clean = numStr.replace(/\s+/g, '');
  let c = 0;
  const invertedArray = clean.split('').map(Number).reverse();
  for (let i = 0; i < invertedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][invertedArray[i]]];
  }
  return VERHOEFF_INV[c].toString();
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

/**
 * Pre-processes an image via HTML5 Canvas (grayscale + contrast stretch) for superior OCR accuracy
 */
export async function preprocessImageForOcr(imageSource: string | File | Blob): Promise<string | File | Blob> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return imageSource;
  }

  try {
    const img = new Image();
    const url = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageSource;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Grayscale and simple contrast enhancement
    for (let i = 0; i < d.length; i += 4) {
      const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // Contrast stretch
      const adjusted = avg > 128 ? Math.min(255, avg * 1.15) : Math.max(0, avg * 0.85);
      d[i] = adjusted;
      d[i + 1] = adjusted;
      d[i + 2] = adjusted;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return imageSource;
  }
}

/**
 * Parses raw text extracted from an Indian Identity Document into structured demographic fields
 */
export function parseDocumentText(rawText: string, confidence: number = 85): ParsedDocumentData {
  const normalized = rawText.replace(/\r/g, '\n');
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Determine Document Type
  let docType: ParsedDocumentData['documentType'] = 'Identity Document';
  if (/aadhaar|uidai|unique identification|मेरा आधार|पहचान/i.test(rawText)) {
    docType = 'Aadhaar Card';
  } else if (/ration|food security|pds|खाद्य|राशन कार्ड/i.test(rawText)) {
    docType = 'Ration Card';
  } else if (/election commission|voter|epic|निर्वाचन आयोग|मतदाता/i.test(rawText)) {
    docType = 'Voter ID';
  } else if (/income certificate|tahsildar|revenue|आय प्रमाण पत्र/i.test(rawText)) {
    docType = 'Income Certificate';
  } else if (/income tax department|permanent account number|pan card/i.test(rawText)) {
    docType = 'PAN Card';
  }

  // 2. Extract Aadhaar number (12 digits) & validate Verhoeff
  let aadhaarNumber: string | undefined;
  let aadhaarLast4: string | undefined;
  let isVerhoeffValid: boolean | undefined;

  const aadhaarMatch = rawText.match(/\b\d{4}\s\d{4}\s\d{4}\b/) || rawText.match(/\b\d{12}\b/);
  if (aadhaarMatch) {
    const full = aadhaarMatch[0].replace(/\s/g, '');
    aadhaarNumber = full;
    aadhaarLast4 = full.slice(-4);
    isVerhoeffValid = validateVerhoeff(full);
  }

  // 3. Extract Gender
  let gender: string | undefined;
  if (/\b(?:female|महिला|स्त्री)\b/i.test(rawText)) {
    gender = 'female';
  } else if (/\b(?:male|पुरुष)\b/i.test(rawText)) {
    gender = 'male';
  } else if (/\b(?:transgender|अन्य)\b/i.test(rawText)) {
    gender = 'other';
  }

  // 4. Extract DOB / Year of Birth and Age
  let age: number | undefined;
  const currentYear = new Date().getFullYear();
  const dobMatch = rawText.match(/(?:DOB|D\.O\.B|Date of Birth|Year of Birth|जन्म तिथि|जन्म वर्ष)[:\s]*([0-9]{2}[/-][0-9]{2}[/-][0-9]{4}|[0-9]{4})/i)
    || rawText.match(/\b([0-9]{2}[/-][0-9]{2}[/-][12][90][0-9]{2})\b/);

  if (dobMatch && dobMatch[1]) {
    const dateStr = dobMatch[1];
    if (dateStr.length === 4) {
      const birthYear = parseInt(dateStr, 10);
      if (birthYear > 1920 && birthYear <= currentYear) {
        age = currentYear - birthYear;
      }
    } else {
      const parts = dateStr.split(/[-/]/);
      const birthYear = parseInt(parts[parts.length - 1], 10);
      if (birthYear > 1920 && birthYear <= currentYear) {
        age = currentYear - birthYear;
      }
    }
  }

  // 5. Extract State
  let state: string | undefined;
  for (const s of INDIAN_STATES) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(rawText)) {
      state = s;
      break;
    }
  }

  // 6. Extract PIN Code (6 digits starting with 1-9)
  let pincode: string | undefined;
  const pinMatch = rawText.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    pincode = pinMatch[1];
  }

  // 7. Extract Name with heuristic filters
  let name: string | undefined;
  const ignoredWordsRegex = /government|india|uidai|father|address|help|www|enrollment|enrolment|download|unique|authority|identification|card|republic|state|department|commission|aadhaar|pehchan|mera|meri/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/[^\w\s]/g, '').trim();
    if (ignoredWordsRegex.test(line)) continue;
    
    // Look for capitalized name formats (2 to 4 words of English letters)
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(line)) {
      name = line;
      break;
    }
  }

  // Secondary name extraction if primary regex missed
  if (!name) {
    for (const line of lines) {
      if (ignoredWordsRegex.test(line)) continue;
      if (/^[a-zA-Z\s]{4,35}$/.test(line) && !/male|female|dob|year|birth|pincode|number/i.test(line)) {
        const words = line.split(/\s+/).filter(Boolean);
        if (words.length >= 2 && words.length <= 4) {
          name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          break;
        }
      }
    }
  }

  return {
    name: name || undefined,
    age: age || undefined,
    gender: gender || undefined,
    state: state || undefined,
    pincode: pincode || undefined,
    aadhaarNumber: aadhaarNumber || undefined,
    aadhaarLast4: aadhaarLast4 || undefined,
    isVerhoeffValid: isVerhoeffValid ?? false,
    documentType: docType,
    confidence: Math.round(confidence),
    rawText,
  };
}

/**
 * End-to-end OCR processing with Tesseract.js and pre-processing
 */
export async function parseDocumentImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedDocumentData> {
  onProgress?.(10, 'Initializing OCR engine...');

  let rawText = '';
  let confidence = 85;

  try {
    const processedSource = await preprocessImageForOcr(imageSource);
    onProgress?.(25, 'Loading Tesseract models...');
    
    const worker = await createWorker('eng');
    onProgress?.(50, 'Scanning document image...');
    
    const ret = await worker.recognize(processedSource);
    rawText = ret.data.text || '';
    confidence = Math.round(ret.data.confidence || 85);
    await worker.terminate();
  } catch (err) {
    console.warn('Tesseract recognition fallback:', err);
    rawText = typeof imageSource === 'string' ? imageSource : '';
  }

  onProgress?.(85, 'Extracting demographic fields...');
  const result = parseDocumentText(rawText, confidence);
  onProgress?.(100, 'Verification complete!');

  return result;
}
