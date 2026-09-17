import { z } from 'zod';

export const UserProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  income: z.number().optional(),
  state: z.string().optional(),
  caste: z.string().optional(),
  verified: z.boolean().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

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
