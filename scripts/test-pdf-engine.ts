import { generateFilledForm, generateAcknowledgementReceipt } from '../src/lib/pdf/generator';
import { getApplicationById } from '../src/lib/storage/applications';

async function testPdfEngine() {
  console.log("=== TESTING PDF FORM & RECEIPT ENGINE ===");

  // 1. Test Application Form Generation
  const profile = {
    name: "Ramesh Kumar",
    age: 45,
    gender: "male",
    occupation: "farmer",
    state: "Punjab",
    aadhaarLast4: "4892",
    mobile: "9876543210",
  };

  const formPdf = await generateFilledForm(profile, "pm_kisan");
  console.log(`Generated Form PDF size: ${formPdf.length} bytes`);
  if (!formPdf || formPdf.length < 2000) {
    console.error("FAIL: Form PDF too small or corrupt");
    process.exit(1);
  }

  // 2. Test Acknowledgement Receipt Generation
  const app = await getApplicationById("SS-2026-1042");
  if (!app) {
    console.error("FAIL: Seed application SS-2026-1042 not found");
    process.exit(1);
  }

  const receiptPdf = await generateAcknowledgementReceipt(app);
  console.log(`Generated Receipt PDF size: ${receiptPdf.length} bytes`);
  if (!receiptPdf || receiptPdf.length < 2000) {
    console.error("FAIL: Receipt PDF too small or corrupt");
    process.exit(1);
  }

  console.log("=== ALL PDF ENGINE TESTS PASSED ===");
}

testPdfEngine().catch(err => {
  console.error("PDF test error:", err);
  process.exit(1);
});
