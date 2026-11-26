import { POST } from '../src/app/api/ekyc/digilocker/route';
import { NextRequest } from 'next/server';

async function testEkyc() {
  console.log("=== TESTING EKYC DIGILOCKER GATEWAY ===");

  // 1. Send OTP
  const req1 = new NextRequest('http://localhost:3000/api/ekyc/digilocker', {
    method: 'POST',
    body: JSON.stringify({
      action: 'send-otp',
      identifier: '9876543210',
      pin: '123456',
    }),
  });
  const res1 = await POST(req1);
  const data1 = await res1.json();
  console.log("Step 1 (Send OTP):", data1);
  if (!data1.success || !data1.sessionId || !data1.sandboxOtp) {
    console.error("FAIL: Step 1 failed");
    process.exit(1);
  }

  // 2. Verify OTP
  const req2 = new NextRequest('http://localhost:3000/api/ekyc/digilocker', {
    method: 'POST',
    body: JSON.stringify({
      action: 'verify-otp',
      sessionId: data1.sessionId,
      otp: data1.sandboxOtp,
      identifier: '9876543210',
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  console.log("Step 2 (Verify OTP):", data2);
  if (!data2.success || !Array.isArray(data2.documents) || data2.documents.length === 0) {
    console.error("FAIL: Step 2 failed");
    process.exit(1);
  }

  // 3. Fetch Credentials & Digital Signature
  const req3 = new NextRequest('http://localhost:3000/api/ekyc/digilocker', {
    method: 'POST',
    body: JSON.stringify({
      action: 'fetch-credentials',
      sessionId: data1.sessionId,
      selectedDocs: ['Aadhaar Card (UIDAI)', 'Ration Card (NFSA)'],
      citizenName: 'Rameshwar Singh',
      state: 'Uttar Pradesh',
      age: 44,
      gender: 'male',
    }),
  });
  const res3 = await POST(req3);
  const data3 = await res3.json();
  console.log("Step 3 (Credentials & Digital Signature):", data3);
  if (!data3.success || !data3.verifiedData.digitalSignature.startsWith('SHA256:')) {
    console.error("FAIL: Step 3 failed");
    process.exit(1);
  }

  console.log("=== ALL EKYC DIGILOCKER TESTS PASSED ===");
}

testEkyc().catch(err => {
  console.error("EKYC test exception:", err);
  process.exit(1);
});
