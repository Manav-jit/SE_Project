import { searchApplications, createApplication, advanceApplicationStatus } from '../src/lib/storage/applications';

async function testRegistry() {
  console.log("=== TESTING APPLICATION LIFECYCLE REGISTRY ===");

  // 1. Create a new application
  const newApp = await createApplication({
    schemeId: "pm_svanidhi",
    schemeName: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    category: "employment",
    applicantName: "Sunil Verma",
    mobile: "9812345678",
    aadhaarLast4: "5512",
    state: "Uttar Pradesh",
    submissionMode: "ONLINE",
    sanctionedAmount: "Rs. 10,000 working capital loan",
  });

  console.log("Created Application:", newApp.id, newApp.status);
  if (!newApp.id.startsWith("SS-2026-") || newApp.status !== "SUBMITTED") {
    console.error("FAIL: new application creation failed");
    process.exit(1);
  }

  // 2. Search by mobile number
  const searchResults = await searchApplications("9812345678");
  console.log(`Search by mobile '9812345678' found: ${searchResults.length} records`);
  if (!searchResults.some(a => a.id === newApp.id)) {
    console.error("FAIL: search by mobile failed");
    process.exit(1);
  }

  // 3. Search by Aadhaar Last 4
  const aadhaarResults = await searchApplications("5512");
  console.log(`Search by Aadhaar '5512' found: ${aadhaarResults.length} records`);
  if (!aadhaarResults.some(a => a.id === newApp.id)) {
    console.error("FAIL: search by Aadhaar failed");
    process.exit(1);
  }

  // 4. Advance status
  const advanced = await advanceApplicationStatus(newApp.id, "UNDER_VERIFICATION", "Documents validated by CSC operator.");
  console.log("Advanced Status:", advanced?.status);
  if (advanced?.status !== "UNDER_VERIFICATION") {
    console.error("FAIL: advance status failed");
    process.exit(1);
  }

  console.log("=== ALL APPLICATION REGISTRY TESTS PASSED ===");
}

testRegistry().catch(err => {
  console.error("Registry test error:", err);
  process.exit(1);
});
