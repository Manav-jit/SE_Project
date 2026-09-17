import { findRelevantSchemes } from '../src/lib/rag/retriever';

async function main() {
  console.log("Querying 'I am a poor farmer in need of money'...");
  const results = await findRelevantSchemes("I am a poor farmer in need of money", 2);
  console.log("Found schemes:", results.map(r => r.name));
}

main().catch(console.error);
