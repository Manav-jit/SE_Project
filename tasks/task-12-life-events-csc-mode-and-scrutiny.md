# TASK-12: Life-Event Milestone Engine, AI Pre-Scrutiny & CSC Kiosk Mode

## Overview & GovTech Benchmarking
Following extensive research and recommendations from the LLM Council benchmarking leading global and Indian digital public infrastructure (DPI)—including **e-Estonia** (proactive life-event governance), **Singapore OGP / FormSG** (verified citizen pre-fill), **Haqdarshak** (assisted last-mile welfare delivery and rejection prevention), and **Code for America** (benefit bundling)—this task implements four transformative capabilities that transcend generic AI chatbots.

---

## Key Pillars Implemented

### 1. Life-Event Entitlement Navigator (Estonia Proactive Model)
- **Engine**: [src/lib/schemes/lifeEvents.ts](file:///d:/SE_PROJECT2/src/lib/schemes/lifeEvents.ts) defines 5 life-event milestone bundles:
  1. `Newborn & Maternity` (PMMVY + JSY) - ₹11,000 one-time benefit
  2. `Crop Sowing & Monsoon` (PM-KISAN + PMFBY + Soil Health Card) - ₹6,000/year + 100% Crop Insurance
  3. `Higher Education & Skills` (NMMSS + Pre/Post-Matric Scholarships) - ₹12,000/year scholarship
  4. `Senior Citizen Security` (IGNOAPS + PMSBY + Ayushman Bharat) - ₹1,000/mo pension + ₹5L health cover
  5. `Micro-Enterprise Launch` (PMMY MUDRA + PM Vishwakarma) - ₹10,00,000 collateral-free credit
- **UI Component**: [src/components/LifeEventNavigator.tsx](file:///d:/SE_PROJECT2/src/components/LifeEventNavigator.tsx) provides a milestone carousel on the home landing page with instant 1-click pre-filtering directly into the Copilot.

### 2. AI Document Pre-Scrutiny & DBT Seeding Inspector (Haqdarshak Model)
- **Scrutiny Engine**: [src/lib/ocr/scrutiny.ts](file:///d:/SE_PROJECT2/src/lib/ocr/scrutiny.ts) performs automated client-side document pre-scrutiny before government submission:
  - **Fuzzy Name Matching**: Computes combined Jaccard token and Levenshtein distance similarity between OCR extracted card names and profile applicant names.
  - **DBT / PFMS Seeding Verification**: Checks Aadhaar seeding status with bank account and NPCI Aadhaar Payment Bridge (APB) mapping.
  - **Proactive Rejection Alerts**: Generates clear remediation instructions if name mismatch exceeds 15% or bank seeding is missing.
- **Integration**:
  - Modal warnings inside [src/components/DocumentScannerModal.tsx](file:///d:/SE_PROJECT2/src/components/DocumentScannerModal.tsx).
  - Living Dossier Pre-Scrutiny & DBT Status card in [src/app/chat/page.tsx](file:///d:/SE_PROJECT2/src/app/chat/page.tsx).

### 3. CSC Operator Kiosk Mode & Assisted-Tech Workstation (Haqdarshak Assisted Tech)
- **Operator Bar**: [src/components/CscOperatorBar.tsx](file:///d:/SE_PROJECT2/src/components/CscOperatorBar.tsx) mounted globally in [src/app/layout.tsx](file:///d:/SE_PROJECT2/src/app/layout.tsx):
  - Workstation badge identifying Village Level Entrepreneur (`VLE-UP-88421 - Block Bighapur, Unnao`).
  - Active multi-citizen queue switcher (`3 Citizens in Queue`).
  - 1-Click WhatsApp Family Summary Link generating formatted entitlement dossiers with reference links.
  - Physical Slip Print trigger for low-literacy rural applicants.

### 4. Floating Stage Demo Presenter Dock (Stage Presentation & Zero-Typing Demo)
- **Presenter Dock**: [src/components/DemoPresenterDock.tsx](file:///d:/SE_PROJECT2/src/components/DemoPresenterDock.tsx) mounted globally in [src/app/layout.tsx](file:///d:/SE_PROJECT2/src/app/layout.tsx):
  - 3 Curated 1-Click Personas:
    - 🌾 **Ramesh Kumar**: Small Farmer (1.5 ha, UP) &rarr; PM-KISAN & PMFBY
    - 🎓 **Ananya Das**: Class 9 SC Student (Bihar) &rarr; NMMSS & Post-Matric
    - 👩 **Sunita Devi**: Artisan / Mother (MP) &rarr; Vishwakarma & Ladli Behna
  - 🔄 **Clean Slate / Reset Demo**: 1-click instant flush of localStorage, saved schemes, and applicant dossiers back to pristine default state.

---

## Verification & Status
- **TypeScript**: 0 compilation errors across entire project.
- **ESLint**: 0 errors, 0 warnings across all components and pages.
- **Production Build**: 15/15 routes compiled cleanly with Turbopack.
- **Status**: 🟢 **Completed & Verified**
