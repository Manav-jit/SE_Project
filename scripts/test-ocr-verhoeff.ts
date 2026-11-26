import { validateVerhoeff, generateVerhoeffCheckDigit, parseDocumentText } from '../src/lib/ocr/parser';

console.log("=== TESTING VERHOEFF ALGORITHM ===");

// 1. Test check digit generation
const base11 = "54829104632";
const checkDigit = generateVerhoeffCheckDigit(base11);
const fullAadhaar = base11 + checkDigit;
console.log(`Base 11: ${base11}, Check Digit: ${checkDigit}, Full: ${fullAadhaar}`);

const isValid = validateVerhoeff(fullAadhaar);
console.log(`Verhoeff check on ${fullAadhaar}: ${isValid}`);
if (!isValid) {
  console.error("FAIL: generated Aadhaar is not Verhoeff valid!");
  process.exit(1);
}

// 2. Test tampering detection
const tampered = fullAadhaar.slice(0, -1) + ((Number(checkDigit) + 1) % 10);
const isTamperedValid = validateVerhoeff(tampered);
console.log(`Tampered Aadhaar ${tampered} validity: ${isTamperedValid} (Expected: false)`);
if (isTamperedValid) {
  console.error("FAIL: tampered Aadhaar should be invalid!");
  process.exit(1);
}

// 3. Test parseDocumentText
const sampleText = `
GOVERNMENT OF INDIA
Unique Identification Authority of India
Mera Aadhaar, Meri Pehchan
Rajesh Sundaram
DOB: 15/08/1982
Gender: Male / पुरुष
Address: Pune, Maharashtra - 411001
${fullAadhaar}
`;

const parsed = parseDocumentText(sampleText, 92);
console.log("Parsed sample document:", parsed);

if (parsed.documentType !== 'Aadhaar Card') {
  console.error("FAIL: docType expected Aadhaar Card, got", parsed.documentType);
  process.exit(1);
}
if (parsed.name !== 'Rajesh Sundaram') {
  console.error("FAIL: name expected Rajesh Sundaram, got", parsed.name);
  process.exit(1);
}
if (parsed.age !== (new Date().getFullYear() - 1982)) {
  console.error("FAIL: age mismatch, got", parsed.age);
  process.exit(1);
}
if (parsed.gender !== 'male') {
  console.error("FAIL: gender expected male, got", parsed.gender);
  process.exit(1);
}
if (parsed.state !== 'Maharashtra') {
  console.error("FAIL: state expected Maharashtra, got", parsed.state);
  process.exit(1);
}
if (parsed.pincode !== '411001') {
  console.error("FAIL: pincode expected 411001, got", parsed.pincode);
  process.exit(1);
}
if (!parsed.isVerhoeffValid) {
  console.error("FAIL: isVerhoeffValid expected true");
  process.exit(1);
}

console.log("=== ALL OCR & VERHOEFF TESTS PASSED ===");
