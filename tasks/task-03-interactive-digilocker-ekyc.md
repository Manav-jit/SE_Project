# TASK-03: Interactive DigiLocker eKYC System

## Objective
Upgrade `DigiLockerModal.tsx` into a multi-step interactive DigiLocker eKYC simulator that provides an authentic citizen verification experience.

## Key Deliverables
1. **Multi-Step eKYC Flow**:
   - Step 1: **Identity Authentication** (Mobile Number / Aadhaar Number entry with validation).
   - Step 2: **Consent & OTP Verification** (6-digit OTP entry with auto-countdown timer, resend button, and valid OTP verification simulation).
   - Step 3: **Document Fetch & Consent** (Citizen selects which documents to share: Aadhaar Card, Ration Card, Income Certificate, Caste Certificate).
   - Step 4: **Verified Credentials Review & Sync** (Displays official green verification badge with timestamp and DigiLocker ID).
2. **Profile State Enrichment**:
   - Updates `UserProfile` with `verified: true`, `digilockerId`, `aadhaarLast4`, `caste`, `verifiedDocuments: string[]`.
3. **UI Enhancements**:
   - Official DigiLocker styling (Government of India emblems, trusted green security accents).
   - Verified badge dynamically shown in the chat sidebar, dashboard, and wizard.

## Verification
- Walk through the full OTP and document selection flow.
- Ensure verified profile persists to `localStorage` and triggers `PROFILE_EVENT`.
- Ensure tests & build pass.
