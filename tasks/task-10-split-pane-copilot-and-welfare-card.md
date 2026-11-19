# TASK-10: Split-Pane Welfare Workspace & Digital Entitlement Card (LLM Council Upgrades)

## Status: COMPLETED

## Objective
Implement the LLM Council's verdict to eliminate the "generic chatbot" aesthetic by transitioning SchemeSaathi from a standard conversational message box into an **Action-Oriented Benefit Studio & Living Application Canvas**.

## Key Deliverables
1. **Benefit Valuation Registry (`src/lib/schemes/benefits.ts`)**:
   - Financial value breakdown (annual monetary benefit amount in ₹, benefit type: Direct DBT, Insurance, Subsidy, Pension, Scholarship) for all 20 schemes.
   - Official Gazette statutory citations mapped to each scheme (e.g., *MoA&FW S.O. 1-1/2019-Credit-I*).
   - Dynamic calculation of cumulative annual value, direct cash total, and risk cover.
2. **Official Citizen Welfare Entitlement Card (`src/components/CitizenWelfareCardModal.tsx`)**:
   - Digital PVC-style welfare entitlement card.
   - Holographic DPI emblem, verified citizen details, QR verification token, breakdown of pre-qualified schemes, and cumulative annual entitlement.
   - Instant printable/downloadable format (`window.print()`).
3. **Split-Pane Workspace Redesign (`src/app/chat/page.tsx`)**:
   - **Primary Canvas (58%)**:
     - Sticky **Cumulative Annual Benefit Ticker** (e.g. `₹58,000/yr unlocked`).
     - **Form No. 1 Auto-Populating Application Canvas**: Visual government application document with live verified badges (`OCR/eKYC Verified`) and document readiness checks.
     - **Pre-Qualified Schemes Stream** with direct actions: "Download Official Form" (registers live tracking ID), "Verify Proof Graph (DAG)", and "Details".
     - Direct Toolbar: "Official Welfare Card", "Scan ID (OCR)", "DigiLocker eKYC".
   - **Ambient Copilot Drawer (42%)**:
     - Constrained conversational assistant with vernacular audio synthesis toggle, English/Hindi language toggle, and 1-tap Generative UI quick chips.
   - **Responsive Mobile Experience**:
     - 2-tab mobile switcher (`[Live Dossier]` vs `[AI Copilot]`).
4. **Scheme Cards Statutory Citations (`src/components/SchemeCard.tsx`)**:
   - Displays statutory order citations and benefit value badges across `/chat`, `/matches`, and `/dashboard`.

## Verification
- Verified: `npx tsx scripts/test-dag.ts` (all 20 schemes evaluate with 0 contradictions).
- Verified: `npm run lint` (0 errors, 0 warnings).
- Verified: `npm run build` (100% compiled static & dynamic routes).
