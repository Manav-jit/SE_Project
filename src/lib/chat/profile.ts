import { z } from 'zod';

export const UserProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  income: z.number().optional(),
  annualIncome: z.number().optional(),
  landHoldingHectares: z.number().optional(),
  state: z.string().optional(),
  caste: z.string().optional(),
  mobile: z.string().optional(),
  aadhaarLast4: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  verified: z.boolean().optional(),
  digilockerId: z.string().optional(),
  digitalSignature: z.string().optional(),
  verificationTimestamp: z.string().optional(),
  verifiedDocuments: z.array(z.string()).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const PROFILE_STORAGE_KEY = 'schemesaathi_profile';
export const PROFILE_EVENT = 'schemesaathi:profile-updated';

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const validated = UserProfileSchema.safeParse(parsed);
    return validated.success ? validated.data : {};
  } catch (e) {
    console.error('Failed to read profile from localStorage', e);
    return {};
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: profile }));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function clearStoredProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: {} }));
  } catch (e) {
    console.error('Failed to clear profile from localStorage', e);
  }
}

export function getMissingProfileFields(profile: UserProfile): string[] {
  const missing: string[] = [];
  if (!profile.age) missing.push("age");
  if (!profile.occupation) missing.push("occupation");
  if (!profile.income) missing.push("income");
  if (!profile.gender) missing.push("gender");
  if (!profile.state) missing.push("state");
  return missing;
}

export function formatProfileForPrompt(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2);
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

export function extractProfileHeuristics(text: string): Partial<UserProfile> {
  const result: Partial<UserProfile> = {};
  if (!text) return result;

  const lower = text.toLowerCase();

  // 1. Landholding in hectares
  const landHectareMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hectares?|ha)\b/i);
  if (landHectareMatch) {
    result.landHoldingHectares = parseFloat(landHectareMatch[1]);
  } else {
    const landAcreMatch = text.match(/(\d+(?:\.\d+)?)\s*acres?\b/i);
    if (landAcreMatch) {
      result.landHoldingHectares = Math.round(parseFloat(landAcreMatch[1]) * 0.404686 * 100) / 100;
    }
  }

  // 2. Occupation
  if (/\b(?:farmer|kisan|कृषि|किसान|cultivator)\b/i.test(lower)) {
    result.occupation = 'farmer';
  } else if (/\b(?:student|विद्यार्थी|studying|class\s*\d+)\b/i.test(lower)) {
    result.occupation = 'student';
  } else if (/\b(?:artisan|craftsman|karigar|कारीगर|weaver)\b/i.test(lower)) {
    result.occupation = 'artisan';
  } else if (/\b(?:street vendor|vendor|hawker|रेहड़ी|पटरी)\b/i.test(lower)) {
    result.occupation = 'street vendor';
  } else if (/\b(?:homemaker|housewife|गृहणी)\b/i.test(lower)) {
    result.occupation = 'homemaker';
  } else if (/\b(?:laborer|daily wage|मजदूर|worker)\b/i.test(lower)) {
    result.occupation = 'laborer';
  } else if (/\b(?:self-employed|business|दुकानदार)\b/i.test(lower)) {
    result.occupation = 'self-employed';
  }

  // 3. Gender
  if (/\b(?:female|woman|girl|mother|महिला|औरत|माता)\b/i.test(lower)) {
    result.gender = 'female';
  } else if (/\b(?:male|man|boy|father|पुरुष|आदमी)\b/i.test(lower)) {
    result.gender = 'male';
  }

  // 4. Age
  const ageMatch = text.match(/\b(?:age|aged|i am|age is)[:\s]*([1-9][0-9]?)\b/i) || text.match(/\b([1-9][0-9]?)\s*(?:years?\s*old|yrs?\s*old)\b/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge >= 5 && parsedAge <= 110) {
      result.age = parsedAge;
    }
  }

  // 5. State
  for (const st of INDIAN_STATES) {
    const regex = new RegExp(`\\b${st}\\b`, 'i');
    if (regex.test(text)) {
      result.state = st;
      break;
    }
  }

  // 6. Caste
  if (/\b(?:sc|scheduled caste|अनुसूचित जाति)\b/i.test(lower)) {
    result.caste = 'SC';
  } else if (/\b(?:st|scheduled tribe|अनुसूचित जनजाति)\b/i.test(lower)) {
    result.caste = 'ST';
  } else if (/\b(?:obc|other backward class|पिछड़ा वर्ग)\b/i.test(lower)) {
    result.caste = 'OBC';
  } else if (/\b(?:general|सामान्य)\b/i.test(lower)) {
    result.caste = 'General';
  }

  return result;
}

