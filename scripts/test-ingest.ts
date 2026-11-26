import { parseGovernmentSchemeText, saveIngestedScheme } from '../src/lib/schemes/ingest';
import { loadSchemes } from '../src/lib/schemes/loader';

async function testIngestPipeline() {
  console.log("=== TESTING AUTOMATED GOVERNMENT SCHEME INGESTION ===");

  const sampleGovtRelease = `
PRESS INFORMATION BUREAU - GOVERNMENT OF INDIA
MINISTRY OF FISHERIES, ANIMAL HUSBANDRY AND DAIRYING

Scheme Name: Pradhan Mantri Matsya Sampada Yojana (PMMSY)
Ministry of Fisheries, Animal Husbandry and Dairying

The Government of India has launched the flagship scheme "Pradhan Mantri Matsya Sampada Yojana" (PMMSY) to bring about a blue revolution through sustainable and responsible development of the fisheries sector in India.

Eligibility Criteria:
1. Fishers, Fish farmers, Fish workers, Fish vendors, and SHGs.
2. Age: Adult citizens aged 18 to 65 years.
3. Gender: All genders eligible, with special focus on women entrepreneurs and SC/ST communities.
4. Annual income limit: Priority given to low-income fisher households with income below Rs. 3,00,000.

Benefits:
Direct capital subsidy of 40% for General category and up to 60% for Women and SC/ST beneficiaries for aquaculture ponds, biofloc units, modern fishing vessels, and cold chain infrastructure. Total investment package of Rs. 20,050 Crores.

Documents Required:
- Aadhaar Card
- Bank Account Details (Aadhaar Seeded)
- Land ownership / Water body lease deed
- Caste certificate where applicable

Application Process:
Apply online through the National PMMSY Portal (pmmsy.dof.gov.in) or submit detailed project report (DPR) to District Fisheries Officer.

Statutory Citation: Gazette Notification No. 12015/01/2020-Fy (Fisheries Division)
`;

  // 1. Parse raw text
  const scheme = parseGovernmentSchemeText(sampleGovtRelease, "https://pmmsy.dof.gov.in/");
  console.log("Parsed Scheme:", {
    id: scheme.id,
    name: scheme.name,
    ministry: scheme.ministry,
    category: scheme.category,
    eligibility: scheme.eligibility,
    benefits: scheme.benefits.slice(0, 100) + '...',
  });

  if (!scheme.name.includes('Matsya') || scheme.category !== 'agriculture') {
    console.error("FAIL: Name or category extraction mismatch");
    process.exit(1);
  }

  // 2. Save to data/schemes/
  const filePath = await saveIngestedScheme(scheme);
  console.log("Saved Scheme to:", filePath);

  // 3. Verify it is loaded by loadSchemes()
  const allSchemes = await loadSchemes();
  const found = allSchemes.find(s => s.id === scheme.id);
  if (!found) {
    console.error("FAIL: Scheme not found in loaded catalog!");
    process.exit(1);
  }

  console.log(`✓ Total schemes in SchemeSaathi catalog now: ${allSchemes.length}`);
  console.log("=== AUTOMATED INGESTION PIPELINE VERIFIED SUCCESSFULLY! ===");
}

testIngestPipeline().catch(err => {
  console.error("Ingest test error:", err);
  process.exit(1);
});
