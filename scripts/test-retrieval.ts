import { findRelevantSchemes } from '../src/lib/rag/retriever';

async function main() {
  console.log("Querying 'I am a poor farmer in need of money' with farmer profile...");
  const results = await findRelevantSchemes("I am a poor farmer in need of money", 4, {
    age: 45,
    gender: 'male',
    occupation: 'farmer',
    state: 'Punjab'
  });
  console.log("Found farmer schemes:", results.map(r => r.name));

  console.log("\nQuerying student profile...");
  const studentResults = await findRelevantSchemes("need scholarship for college", 4, {
    age: 17,
    gender: 'female',
    occupation: 'student',
    income: 150000
  });
  console.log("Found student schemes:", studentResults.map(r => r.name));
}

main().catch(console.error);
