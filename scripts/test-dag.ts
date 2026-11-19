import { getSchemeDAG, getAllSchemeDAGs } from '../src/lib/dag/rules';
import { evaluateSchemeDAG } from '../src/lib/dag/evaluator';

console.log('=== TESTING FORMAL DAG ELIGIBILITY ENGINE ===\n');

// Test Case 1: Ramesh Kumar (Marginal Farmer, Punjab) -> Eligible for PM-KISAN
const rameshProfile = {
  name: 'Ramesh Kumar',
  age: 42,
  gender: 'male',
  occupation: 'farmer',
  income: 180000,
  landHoldingHectares: 1.5,
  state: 'Punjab',
};

const pmkDag = getSchemeDAG('pm_kisan');
if (!pmkDag) throw new Error('Missing PM-KISAN DAG');

const res1 = evaluateSchemeDAG(pmkDag, rameshProfile);
console.log(`Test 1: Ramesh Kumar for PM-KISAN`);
console.log(`Verdict: ${res1.verdict} (Expected: ELIGIBLE)`);
console.log(`Passed: ${res1.passedCount}, Failed: ${res1.failedCount}, Missing: ${res1.missingCount}`);
console.log(`Summary: ${res1.summary}\n`);

if (res1.verdict !== 'ELIGIBLE') {
  console.error('Test 1 FAILED! Expected ELIGIBLE');
  process.exit(1);
}

// Test Case 2: Ineligible Landholder (Land = 3.5 ha > 2.0 ha ceiling)
const largeFarmerProfile = {
  ...rameshProfile,
  landHoldingHectares: 3.5,
};

const res2 = evaluateSchemeDAG(pmkDag, largeFarmerProfile);
console.log(`Test 2: Large Landholder (3.5 ha) for PM-KISAN`);
console.log(`Verdict: ${res2.verdict} (Expected: INELIGIBLE)`);
console.log(`Passed: ${res2.passedCount}, Failed: ${res2.failedCount}`);
console.log(`Counterfactuals:`, res2.counterfactuals);
console.log(`Summary: ${res2.summary}\n`);

if (res2.verdict !== 'INELIGIBLE' || res2.counterfactuals.length === 0) {
  console.error('Test 2 FAILED! Expected INELIGIBLE with counterfactuals');
  process.exit(1);
}

// Test Case 3: Missing Landholding Info -> CONDITIONAL_INCOMPLETE
const incompleteProfile = {
  name: 'Anita Devi',
  age: 38,
  occupation: 'farmer',
};

const res3 = evaluateSchemeDAG(pmkDag, incompleteProfile);
console.log(`Test 3: Missing Landholding Info`);
console.log(`Verdict: ${res3.verdict} (Expected: CONDITIONAL_INCOMPLETE)`);
console.log(`Missing Count: ${res3.missingCount}\n`);

if (res3.verdict !== 'CONDITIONAL_INCOMPLETE') {
  console.error('Test 3 FAILED! Expected CONDITIONAL_INCOMPLETE');
  process.exit(1);
}

// Test Case 4: Student (Age 15, Income 200,000) for NMMSS
const studentDag = getSchemeDAG('national_merit_scholarship');
if (!studentDag) throw new Error('Missing NMMSS DAG');

const studentProfile = {
  name: 'Priya Sharma',
  age: 15,
  occupation: 'student',
  income: 180000,
};

const res4 = evaluateSchemeDAG(studentDag, studentProfile);
console.log(`Test 4: Class IX Student for NMMSS`);
console.log(`Verdict: ${res4.verdict} (Expected: ELIGIBLE)`);
console.log(`Passed: ${res4.passedCount}, Failed: ${res4.failedCount}\n`);

if (res4.verdict !== 'ELIGIBLE') {
  console.error('Test 4 FAILED! Expected ELIGIBLE');
  process.exit(1);
}

// Test Case 5: Verify all 12 schemes have valid DAGs
const allDags = getAllSchemeDAGs();
console.log(`Test 5: Verify all scheme DAGs compile (${allDags.length} schemes)`);
for (const dag of allDags) {
  const evalResult = evaluateSchemeDAG(dag, rameshProfile);
  console.log(`  ✓ ${dag.schemeId}: Evaluates to ${evalResult.verdict}`);
}

console.log('\n=== ALL DAG TESTS PASSED SUCCESSFULLY! ===');

