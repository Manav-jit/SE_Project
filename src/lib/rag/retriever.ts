import { loadSchemes, Scheme } from "../schemes/loader";
import { generateEmbedding } from "./embeddings";
import { UserProfile } from "../chat/profile";

type SchemeWithEmbedding = Scheme & { embedding?: number[] };
let schemesWithEmbeddings: SchemeWithEmbedding[] | null = null;

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function evaluateEligibility(scheme: Scheme, profile?: UserProfile): { eligible: boolean; scoreModifier: number } {
  if (!profile || Object.keys(profile).length === 0) {
    return { eligible: true, scoreModifier: 0 };
  }

  const elig = scheme.eligibility || {};
  let modifier = 0;

  // 1. Gender check
  if (elig.gender && elig.gender !== 'all' && profile.gender) {
    const userGender = profile.gender.toLowerCase().trim();
    const schemeGender = String(elig.gender).toLowerCase().trim();
    if (userGender !== schemeGender) {
      return { eligible: false, scoreModifier: -10 };
    }
    modifier += 0.2;
  }

  // 2. Age check
  if (profile.age !== undefined && profile.age !== null) {
    const age = Number(profile.age);
    if (!isNaN(age) && age > 0) {
      if (elig.age_min !== undefined && age < elig.age_min) {
        return { eligible: false, scoreModifier: -10 };
      }
      if (elig.age_max !== undefined && age > elig.age_max) {
        return { eligible: false, scoreModifier: -10 };
      }
      modifier += 0.15;
    }
  }

  // 3. Occupation check
  if (profile.occupation) {
    const userOcc = profile.occupation.toLowerCase().trim();
    if (Array.isArray(elig.occupations) && elig.occupations.length > 0) {
      const allowedOccs = elig.occupations.map((o: string) => o.toLowerCase().trim());
      const hasOccMatch = allowedOccs.some((o: string) => userOcc.includes(o) || o.includes(userOcc));
      if (hasOccMatch) {
        modifier += 0.35;
      } else {
        // Exclude strictly mismatched occupations
        if (allowedOccs.includes('student') && !userOcc.includes('student')) {
          return { eligible: false, scoreModifier: -10 };
        }
        if (allowedOccs.includes('farmer') && !allowedOccs.includes(userOcc) && (userOcc === 'student' || userOcc === 'government employee')) {
          return { eligible: false, scoreModifier: -10 };
        }
      }
    }
  }

  // 4. Income check
  if (profile.income !== undefined && profile.income !== null && elig.income_max) {
    const income = Number(profile.income);
    if (!isNaN(income) && income > elig.income_max) {
      return { eligible: false, scoreModifier: -10 };
    }
    if (income <= elig.income_max) {
      modifier += 0.15;
    }
  }

  return { eligible: true, scoreModifier: modifier };
}

export async function initializeRetriever() {
  if (schemesWithEmbeddings && schemesWithEmbeddings.length > 0) return;
  const schemes = await loadSchemes();
  schemesWithEmbeddings = [];

  for (const scheme of schemes) {
    const text = `Name: ${scheme.name}\nCategory: ${scheme.category}\nMinistry: ${scheme.ministry}\nBenefits: ${scheme.benefits}\nEligibility: ${JSON.stringify(scheme.eligibility)}`;
    const embedding = await generateEmbedding(text);
    schemesWithEmbeddings.push({ ...scheme, embedding });
  }
}

export async function findRelevantSchemes(
  query: string,
  k: number = 4,
  profile?: UserProfile
): Promise<Scheme[]> {
  await initializeRetriever();
  const queryEmbedding = await generateEmbedding(query);
  
  const results = schemesWithEmbeddings!.map(scheme => {
    const similarity = dotProduct(queryEmbedding, scheme.embedding!);
    const { eligible, scoreModifier } = evaluateEligibility(scheme, profile);
    
    // Ineligible schemes get dropped below threshold
    const finalScore = eligible ? similarity + scoreModifier : -10;

    return {
      scheme,
      score: finalScore,
      eligible
    };
  });

  // Filter out definitely ineligible candidates if a profile was provided
  const candidates = profile && Object.keys(profile).length > 0
    ? results.filter(r => r.eligible)
    : results;

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, k).map(r => r.scheme);
}
