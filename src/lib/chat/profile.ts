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
