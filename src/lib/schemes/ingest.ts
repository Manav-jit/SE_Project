import fs from 'fs/promises';
import path from 'path';
import { Scheme } from './loader';

/**
 * Normalizes a scheme title into a clean snake_case ID
 */
export function slugifySchemeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(pradhan\s*mantri|yojana|scheme|national|mission)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('_') || `gov_scheme_${Date.now()}`;
}

/**
 * Extracts clean text from an HTML document string
 */
export function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses raw government text into a validated SchemeSaathi Scheme object
 */
export function parseGovernmentSchemeText(rawText: string, sourceUrl?: string): Scheme {
  const lines = rawText.split(/\n|\. |\.\n/).map(l => l.trim()).filter(Boolean);

  // 1. Extract Scheme Name
  let name = '';
  const titleMatch = rawText.match(/(?:scheme name|name of scheme|title)[:\s]*([^\n.]+)/i)
    || rawText.match(/\b((?:Pradhan Mantri|Rashtriya|PM|National|Mukhyamantri|State)\s+[A-Za-z\s]+(?:Yojana|Scheme|Mission|Abhiyan|Nidhi|Bima))\b/i);
  
  if (titleMatch && titleMatch[1]) {
    name = titleMatch[1].trim();
  } else if (lines.length > 0) {
    name = lines[0].slice(0, 80);
  } else {
    name = 'Government Welfare Scheme';
  }

  const id = slugifySchemeId(name);

  // 2. Extract Ministry / Department
  let ministry = 'Government of India';
  const ministryMatch = rawText.match(/\b(Ministry of [A-Za-z\s&,]+|Department of [A-Za-z\s&,]+)/i);
  if (ministryMatch) {
    ministry = ministryMatch[1].split(/\n|\r/)[0].replace(/Scheme Name|Title/i, '').trim();
  }

  // 3. Extract Category
  let category = 'welfare';
  const lower = rawText.toLowerCase();
  if (/farmer|kisan|agriculture|crop|sowing|soil|harvest/i.test(lower)) {
    category = 'agriculture';
  } else if (/health|hospital|medical|ayushman|treatment|doctor|medicine/i.test(lower)) {
    category = 'healthcare';
  } else if (/student|scholarship|school|college|education|tuition/i.test(lower)) {
    category = 'education';
  } else if (/house|housing|awas|shelter|dwelling/i.test(lower)) {
    category = 'housing';
  } else if (/solar|energy|power|electricity|bijli/i.test(lower)) {
    category = 'energy';
  } else if (/loan|credit|subsidy|mudra|bank|finance|interest/i.test(lower)) {
    category = 'financial';
  } else if (/woman|women|mother|maternity|girl|mahila/i.test(lower)) {
    category = 'women';
  } else if (/job|employment|artisan|worker|laborer|vendor|skill/i.test(lower)) {
    category = 'employment';
  }

  // 4. Extract Eligibility Parameters
  let age_min = 18;
  let age_max = 70;
  const ageRangeMatch = rawText.match(/\b(?:aged?|age between)\s*(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*years?\b/i);
  if (ageRangeMatch) {
    age_min = parseInt(ageRangeMatch[1], 10);
    age_max = parseInt(ageRangeMatch[2], 10);
  } else {
    const minMatch = rawText.match(/\b(?:above|minimum age|at least)\s*(\d{1,2})\s*years?\b/i);
    if (minMatch) age_min = parseInt(minMatch[1], 10);
    const maxMatch = rawText.match(/\b(?:up to|maximum age|below)\s*(\d{1,2})\s*years?\b/i);
    if (maxMatch) age_max = parseInt(maxMatch[1], 10);
  }

  let gender: string = 'all';
  if (/\b(?:women only|females only|for adult females|mothers only)\b/i.test(lower)) {
    gender = 'female';
  }

  const occupations: string[] = [];
  if (/farmer|cultivator/i.test(lower)) occupations.push('farmer');
  if (/student|pupil/i.test(lower)) occupations.push('student');
  if (/artisan|craftsman|weaver/i.test(lower)) occupations.push('artisan');
  if (/street vendor|hawker/i.test(lower)) occupations.push('street vendor');
  if (/laborer|worker|daily wage/i.test(lower)) occupations.push('laborer');
  if (/homemaker/i.test(lower)) occupations.push('homemaker');
  if (occupations.length === 0) occupations.push('self-employed', 'farmer', 'laborer');

  // Income ceiling
  let income_max: number | undefined;
  const incomeMatch = rawText.match(/\b(?:income (?:up to|less than|ceiling of)|below)\s*(?:Rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\s*lakh)?)\b/i);
  if (incomeMatch) {
    const valStr = incomeMatch[1].toLowerCase();
    if (valStr.includes('lakh')) {
      const num = parseFloat(valStr.replace(/[^0-9.]/g, ''));
      income_max = num * 100000;
    } else {
      income_max = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
    }
  }

  // 5. Extract Benefits
  let benefits = "Financial and statutory welfare assistance as per official scheme guidelines.";
  const benefitsMatch = rawText.match(/(?:benefits|financial assistance|entitlement)[:\s]*([^\n.]+)/i);
  if (benefitsMatch && benefitsMatch[1]) {
    benefits = benefitsMatch[1].trim();
  } else {
    const candidate = lines.find(l => /subsidy|assistance of|grant of|lakh|rupees|per year|per month/i.test(l));
    if (candidate) benefits = candidate.slice(0, 200);
  }

  // 6. Extract Documents
  const documents_required: string[] = ["Aadhaar Card", "Bank Account Details (Aadhaar linked)"];
  if (/ration|bpl/i.test(lower)) documents_required.push("Ration Card / BPL Document");
  if (/land|khasra|khatauni|ror/i.test(lower)) documents_required.push("Land Ownership Record (RoR)");
  if (/income/i.test(lower)) documents_required.push("Income Certificate");
  if (/electricity/i.test(lower)) documents_required.push("Recent Electricity Bill");
  if (/caste|sc|st|obc/i.test(lower)) documents_required.push("Caste Certificate");

  // 7. Extract Application Steps
  const application_process = [
    `Apply online via the official portal (${sourceUrl || 'National Portal'}) or nearest Common Service Centre (CSC).`,
    "Submit authenticated Aadhaar and requisite KYC documents.",
    "Verification and direct benefit transfer (DBT) credit by departmental officers."
  ];

  // 8. Extract Statutory Citation
  let statutory_citation: string | undefined;
  const citationMatch = rawText.match(/\b((?:Gazette Notification|Act|G\.O\.|Order|OM|Notification)\s+[A-Za-z0-9\/\-_().]+)\b/i);
  if (citationMatch) {
    statutory_citation = citationMatch[1].trim();
  }

  return {
    id,
    name,
    ministry,
    category,
    eligibility: {
      age_min,
      age_max,
      gender,
      occupations,
      income_max,
      citizenship: "Indian",
    },
    benefits,
    documents_required,
    application_process,
    submission_url: sourceUrl || "https://www.myscheme.gov.in/",
    statutory_citation: statutory_citation || `${ministry} Official Scheme Directives`,
  };
}

/**
 * Saves an ingested Scheme object into `data/schemes/<id>.json`
 */
export async function saveIngestedScheme(scheme: Scheme): Promise<string> {
  const filePath = path.join(process.cwd(), 'data', 'schemes', `${scheme.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(scheme, null, 2), 'utf-8');
  return filePath;
}

/**
 * Fetches HTML from an official government URL and ingests the scheme
 */
export async function fetchAndIngestFromGovUrl(url: string): Promise<{ success: boolean; scheme: Scheme; filePath: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch scheme from URL: HTTP ${res.status}`);
  }

  const html = await res.text();
  const rawText = extractTextFromHtml(html);
  const scheme = parseGovernmentSchemeText(rawText, url);
  const filePath = await saveIngestedScheme(scheme);

  return { success: true, scheme, filePath };
}
