import { extractProfileHeuristics } from '../src/lib/chat/profile';

console.log("=== TESTING DEMOGRAPHIC EXTRACTION ===");

const test1 = extractProfileHeuristics("I am a small farmer with 1.5 hectares of land in Uttar Pradesh.");
console.log("Test 1 (Farmer 1.5 ha UP):", test1);
if (test1.occupation === 'farmer' && test1.landHoldingHectares === 1.5 && test1.state === 'Uttar Pradesh') {
  console.log("✓ Test 1 Passed");
} else {
  console.error("✗ Test 1 Failed", test1);
  process.exit(1);
}

const test2 = extractProfileHeuristics("I am a 15 years old female student looking for SC scholarships in Bihar");
console.log("Test 2 (Student 15 SC Bihar):", test2);
if (test2.occupation === 'student' && test2.age === 15 && test2.gender === 'female' && test2.caste === 'SC' && test2.state === 'Bihar') {
  console.log("✓ Test 2 Passed");
} else {
  console.error("✗ Test 2 Failed", test2);
  process.exit(1);
}

const test3 = extractProfileHeuristics("I am an artisan and street vendor in Madhya Pradesh");
console.log("Test 3 (Artisan/Street Vendor MP):", test3);
if ((test3.occupation === 'artisan' || test3.occupation === 'street vendor') && test3.state === 'Madhya Pradesh') {
  console.log("✓ Test 3 Passed");
} else {
  console.error("✗ Test 3 Failed", test3);
  process.exit(1);
}

console.log("=== ALL HEURISTIC EXTRACTION TESTS PASSED ===");
