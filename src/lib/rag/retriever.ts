import { loadSchemes, Scheme } from "../schemes/loader";
import { generateEmbedding } from "./embeddings";

type SchemeWithEmbedding = Scheme & { embedding?: number[] };
let schemesWithEmbeddings: SchemeWithEmbedding[] | null = null;

function dotProduct(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export async function initializeRetriever() {
  if (schemesWithEmbeddings) return;
  const schemes = await loadSchemes();
  schemesWithEmbeddings = [];

  for (const scheme of schemes) {
    const text = `Name: ${scheme.name}\nCategory: ${scheme.category}\nBenefits: ${scheme.benefits}\nEligibility: ${JSON.stringify(scheme.eligibility)}`;
    const embedding = await generateEmbedding(text);
    schemesWithEmbeddings.push({ ...scheme, embedding });
  }
}

export async function findRelevantSchemes(query: string, k: number = 3): Promise<Scheme[]> {
  await initializeRetriever();
  const queryEmbedding = await generateEmbedding(query);
  
  const results = schemesWithEmbeddings!.map(scheme => {
    return {
      scheme,
      score: dotProduct(queryEmbedding, scheme.embedding!)
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k).map(r => r.scheme);
}
