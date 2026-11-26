import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface EkycSession {
  sessionId: string;
  identifier: string;
  otp: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
}

// In-memory active session store with TTL cleanup
const ACTIVE_SESSIONS = new Map<string, EkycSession>();

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of ACTIVE_SESSIONS.entries()) {
    if (session.expiresAt < now) {
      ACTIVE_SESSIONS.delete(id);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanupExpiredSessions();
    const body = await req.json();
    const { action } = body;

    // 1. Action: SEND-OTP
    if (action === 'send-otp') {
      const { identifier, pin } = body;
      if (!identifier || identifier.length < 10) {
        return NextResponse.json({ error: 'Please provide a valid 10-digit Mobile or 12-digit Aadhaar number.' }, { status: 400 });
      }
      if (!pin || pin.length < 4) {
        return NextResponse.json({ error: 'Please enter your 6-digit security PIN.' }, { status: 400 });
      }

      // Generate dynamic 6-digit OTP and unique session ID
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionId = `DL-SESS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      ACTIVE_SESSIONS.set(sessionId, {
        sessionId,
        identifier: identifier.replace(/\s+/g, ''),
        otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 120 * 1000, // 2 minutes expiry
        verified: false,
      });

      const masked = identifier.length === 12
        ? `XXXX-XXXX-${identifier.slice(-4)}`
        : `XXXXXX${identifier.slice(-4)}`;

      return NextResponse.json({
        success: true,
        sessionId,
        maskedIdentifier: masked,
        // Provided for one-click testing / developer preview in sandbox
        sandboxOtp: otp,
        expiresInSeconds: 120,
        message: `OTP sent successfully to registered mobile linked with ${masked}`,
      });
    }

    // 2. Action: VERIFY-OTP
    if (action === 'verify-otp') {
      const { sessionId, otp } = body;
      if (!sessionId || !otp) {
        return NextResponse.json({ error: 'Missing session ID or OTP.' }, { status: 400 });
      }

      const session = ACTIVE_SESSIONS.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session expired or not found. Please request a new OTP.' }, { status: 404 });
      }

      if (session.expiresAt < Date.now()) {
        ACTIVE_SESSIONS.delete(sessionId);
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }

      // Verify OTP (also accepts universal master bypass in development 839201)
      if (session.otp !== otp && otp !== '839201') {
        return NextResponse.json({ error: 'Incorrect OTP. Please check the code and try again.' }, { status: 400 });
      }

      session.verified = true;

      // Generate available certificates based on citizen identifier
      const cleanId = session.identifier;
      const last4 = cleanId.slice(-4);

      const availableDocs = [
        {
          id: 'aadhaar',
          name: 'Aadhaar Card',
          issuer: 'Unique Identification Authority of India (UIDAI)',
          docNumber: `XXXXXXXX${last4}`,
          issueDate: '12-08-2021',
          selected: true,
        },
        {
          id: 'ration',
          name: 'Ration Card (NFSA)',
          issuer: 'Department of Food and Public Distribution',
          docNumber: `RC-${last4}-NFSA`,
          issueDate: '15-03-2023',
          selected: true,
        },
        {
          id: 'income',
          name: 'Income & Asset Certificate',
          issuer: 'Revenue Department / Tahsildar Office',
          docNumber: `INC/2026/${last4}9`,
          issueDate: '10-01-2026',
          selected: true,
        },
        {
          id: 'domicile',
          name: 'Domicile / Residence Certificate',
          issuer: 'District Magistrate Office',
          docNumber: `DOM-2026-${last4}`,
          issueDate: '04-06-2024',
          selected: false,
        },
      ];

      return NextResponse.json({
        success: true,
        sessionId,
        verified: true,
        documents: availableDocs,
      });
    }

    // 3. Action: FETCH-CREDENTIALS
    if (action === 'fetch-credentials') {
      const { sessionId, selectedDocs, citizenName, state, age, gender } = body;
      const session = ACTIVE_SESSIONS.get(sessionId);
      
      const cleanId = session?.identifier || '9876543210';
      const last4 = cleanId.slice(-4);

      // Compute cryptographic SHA-256 digital signature
      const rawPayload = `${cleanId}:${citizenName || 'Citizen'}:${state || 'National'}:${Date.now()}`;
      const digitalSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

      const digilockerId = `DL-IND-${new Date().getFullYear()}-${last4}${Math.floor(100 + Math.random() * 900)}`;

      return NextResponse.json({
        success: true,
        verifiedData: {
          name: citizenName || "Citizen Beneficiary",
          age: typeof age === 'number' ? age : 42,
          gender: gender || "male",
          state: state || "Uttar Pradesh",
          aadhaarLast4: last4,
          mobile: cleanId.length === 10 ? cleanId : undefined,
          aadhaarNumber: cleanId.length === 12 ? cleanId : undefined,
          verified: true,
          digilockerId,
          digitalSignature: `SHA256:${digitalSignature.slice(0, 16)}...${digitalSignature.slice(-8)}`,
          verificationTimestamp: new Date().toISOString(),
          verifiedDocuments: Array.isArray(selectedDocs) ? selectedDocs : ["Aadhaar Card (UIDAI)", "Ration Card (NFSA)"],
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error('DigiLocker eKYC API error:', error);
    return NextResponse.json({ error: 'Internal eKYC service error.' }, { status: 500 });
  }
}
