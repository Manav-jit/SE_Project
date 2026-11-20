# SchemeSaathi: System Test Case Specification
**Document Code**: Doc: T_01  
**Standard Template**: Dr. Ghazy Assassa Test Case Specification Standard  
**System**: SchemeSaathi (AI-Powered Citizen Welfare Discovery Platform)  
**Date**: 20 November 2026 | **Version**: 2.1 | **Scope**: 6 Core High-Impact Test Cases | **Status**: Verified  

---

## 1. Test Case Template (Doc: T_01)

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | [Name of the test case] | **Test Case #:** | [e.g. TC-01] |
| **Subsystem:** | [Subsystem Name] | **System:** | SchemeSaathi |
| **Design Date:** | DD/MM/YYYY | **Designed by:** | [QA Role / Engineer] |
| **Execution Date:** | DD/MM/YYYY | **Executed by:** | [Tester Name / CI] |
| **Short Description:** | [Concise statement of test objective] | | |

**Pre-conditions:**
- [Prerequisite system state, user credentials, loaded datasets, or network status]

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | [Action 1] | [Expected Response 1] | Pass/Fail | [Notes] |
| 2 | [Action 2] | [Expected Response 2] | Pass/Fail | [Notes] |

**Post-conditions:**
1. [Expected state of the database, session storage, or UI after test completion]

---

## 2. Core Test Suite & Traceability Matrix

| Test # | Subsystem | Test Case Name | Type | Priority | Status |
|---|---|---|---|---|---|
| **TC-01** | AI Chat & Conversational Discovery | Guided Citizen Profile Elicitation via Natural Language Chat | Positive / Functional | High | 🟢 Pass |
| **TC-02** | Quick-Match Wizard | 3-Step Wizard Linear Flow for Scheme Recommendation | Functional / Workflow | High | 🟢 Pass |
| **TC-03** | DigiLocker eKYC Integration | End-to-End Mock DigiLocker Authentication & Identity Injection | Security / eKYC | High | 🟢 Pass |
| **TC-04** | Eligibility Proof Graph (DAG) Engine | Deterministic DAG Rule Evaluation & Visual Proof Graph Rendering | Verification / Logic | High | 🟢 Pass |
| **TC-05** | Smart PDF Form Generator & Action Plan | Dynamic AcroForm Application Form Generation & Download | Document Generation | High | 🟢 Pass |
| **TC-06** | Application Persistence & Lifecycle Tracker | Scheme Application Submission & Lifecycle State Transitions | End-to-End Workflow | High | 🟢 Pass |

---

## 3. Comprehensive SchemeSaathi Test Case Specifications

### TC-01: Guided Citizen Profile Elicitation via Natural Language Chat

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Guided Citizen Profile Elicitation via Natural Language Chat | **Test Case #:** | TC-01 |
| **Subsystem:** | AI Chat & Conversational Discovery | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the AI Chat copilot accurately parses free-form natural language prompts to extract demographic attributes (occupation, landholding size, state) and dynamically renders matching welfare schemes in real time. | | |

**Pre-conditions:**
- SchemeSaathi server is active and accessible at http://localhost:3000/chat.
- Groq LLM API endpoint is configured (or fallback mock chat stream is enabled).
- Client session storage (localStorage) is initialized with an unverified, empty profile.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Navigate to http://localhost:3000/chat. | Chat page loads successfully displaying welcoming AI greeting, living dossier in sidebar, and quick prompt suggestion chips. | **Pass** | Clean initial UI state verified. |
| 2 | Click quick prompt chip: '🌾 Small Farmer (1.5 ha)'. | Input textarea populates with: 'I am a small farmer with 1.5 hectares of land in Uttar Pradesh.' | **Pass** | Prompt chip binding functioning. |
| 3 | Click Send button (or press Enter). | Message sends to /api/chat. AI streams empathetic response. Living dossier updates in real time with occupation='farmer', landSize=1.5, state='Uttar Pradesh'. | **Pass** | Server-sent events & dossier sync validated. |
| 4 | Inspect Matched Schemes section below chat window. | System renders high-confidence scheme cards: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)' and 'PM Fasal Bima Yojana'. | **Pass** | Dynamic RAG retrieval confirmed. |
| 5 | Verify post-conditions. | Profile state saved to localStorage; verified schemes count >= 2. | **Pass** | Persistence verified. |

**Post-conditions:**
1. Citizen profile state in localStorage ('schemesaathi_profile') contains { occupation: 'farmer', landHoldingHectares: 1.5, state: 'Uttar Pradesh' }.
2. Living dossier displays updated attributes with zero console errors.

---

### TC-02: 3-Step Wizard Linear Flow for Scheme Recommendation

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | 3-Step Wizard Linear Flow for Scheme Recommendation | **Test Case #:** | TC-02 |
| **Subsystem:** | Quick-Match Wizard | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the 3-step Quick-Match Wizard successfully collects personal, socio-economic, and location attributes, smoothly advancing through progress milestones to matched results. | | |

**Pre-conditions:**
- User navigates to http://localhost:3000/wizard.
- Clean browser session with no pre-existing profile cached in localStorage.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | On Step 1 (Personal Details), enter Age: '65', select Gender: 'Female'. Click 'Next Step'. | Step validation passes; progress bar advances to Step 2 with smooth transition; profile records { age: 65, gender: 'Female' }. | **Pass** | Step 1 validated. |
| 2 | On Step 2 (Socio-Economic), select Occupation: 'Homemaker' and Caste: 'General'. Click 'Next Step'. | Step 2 validated; progress indicator updates to Step 3 (Location); state accumulates socio-economic inputs. | **Pass** | Step 2 validated. |
| 3 | On Step 3 (Location), select State: 'Madhya Pradesh'. Click 'Find My Eligible Schemes'. | System displays matching loader ('Matching with 20+ sovereign welfare schemes...'); redirects to /matches?profile=... | **Pass** | Profile serialization confirmed. |
| 4 | Inspect /matches page display. | Renders matched schemes: 'Indira Gandhi National Old Age Pension Scheme (NSAP)' and 'Ladli Behna Yojana' (MP state welfare). | **Pass** | State & age criteria verified. |
| 5 | Verify post-conditions. | User profile persists in localStorage; URL parameters reflect selected demographic inputs. | **Pass** | Persistence verified. |

**Post-conditions:**
1. Complete profile { age: 65, gender: 'Female', occupation: 'Homemaker', state: 'Madhya Pradesh' } saved to localStorage.
2. /matches page displays verified eligibility cards for senior citizen welfare.

---

### TC-03: End-to-End Mock DigiLocker Authentication & Identity Injection

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | End-to-End Mock DigiLocker Authentication & Identity Injection | **Test Case #:** | TC-03 |
| **Subsystem:** | DigiLocker eKYC Integration | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the 5-step mock DigiLocker OAuth flow authenticates the citizen, verifies credentials via OTP, gathers document consent, and injects verified Aadhaar/Ration details into the user profile with eKYC verification badges. | | |

**Pre-conditions:**
- User is on /chat or /wizard.
- User profile is currently unverified (verified: false).

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Click 'Connect DigiLocker' button. | DigiLockerModal opens displaying official DigiLocker branding, UIDAI lock icon, and Step 1: Credentials form. | **Pass** | Modal mounted cleanly. |
| 2 | Retain Mobile ('9876543210') and 6-digit PIN ('123456'). Click 'Sign In with DigiLocker'. | Modal transitions to Step 2: OTP Verification; 45-second countdown timer initiates; OTP input field is focused. | **Pass** | Credentials step passed. |
| 3 | Enter OTP: '123456' and click 'Verify OTP'. | Modal transitions to Step 3: Consent Screen; renders 4 fetched certificates (Aadhaar, Ration Card, Income, Domicile). | **Pass** | OTP validation passed. |
| 4 | Select Aadhaar Card and Ration Card. Click 'Consent & Share'. | Transitions to Step 4: Verifying animated spinner ('Fetching cryptographically signed credentials...'); then Step 5: Success screen. | **Pass** | eKYC document retrieval simulated. |
| 5 | Click 'Apply Verified Details'. | Modal closes. Citizen Dossier updates with Name: 'Rameshwar Singh', Age: 44, Gender: 'Male', State: 'Uttar Pradesh', Aadhaar: 'XXXX-XXXX-4892', and green 'Verified ✓' badge. | **Pass** | Profile injection verified. |
| 6 | Verify post-conditions. | localStorage records verified: true, digilockerId: 'DL-IND-2026-98124', and verified documents list. | **Pass** | Audit trail confirmed. |

**Post-conditions:**
1. Citizen profile state has verified: true and official Aadhaar last-4 digits.
2. Scheme ranking engine automatically boosts schemes requiring verified identity (e.g. Ayushman Bharat).

---

### TC-04: Deterministic DAG Rule Evaluation & Visual Proof Graph Rendering

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Deterministic DAG Rule Evaluation & Visual Proof Graph Rendering | **Test Case #:** | TC-04 |
| **Subsystem:** | Eligibility Proof Graph (DAG) Engine | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the formal Directed Acyclic Graph (DAG) evaluates multi-variable logical expressions and displays visual statutory audit trails for PM-KISAN. | | |

**Pre-conditions:**
- User profile has { occupation: 'farmer', landHoldingHectares: 1.5, state: 'Punjab', institutional_landholder: false }.
- User is viewing PM-KISAN scheme card on /matches or /chat.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Click 'Why am I eligible?' (Proof Graph) button on PM-KISAN card. | ProofGraphModal opens, rendering the interactive DAG tree for pm_kisan. | **Pass** | DAG modal mounted. |
| 2 | Inspect Root Node and overall evaluation verdict. | Verdict displays green badge: 'VERDICT: ELIGIBLE'. Passed rules count: 4, Failed: 0, Missing: 0. | **Pass** | Logical AND evaluated. |
| 3 | Inspect individual tree comparison nodes:<br>- Node 1: occupation == 'farmer'<br>- Node 2: landHoldingHectares <= 2.0<br>- Node 3: institutional_landholder == false | Every node displays green checkmark, actual vs expected values (e.g. Actual: 1.5 ha <= Expected: 2.0 ha), and statutory citation ('Clause 3(b) PM-KISAN Operational Guidelines'). | **Pass** | Node-level audit trail verified. |
| 4 | Click on individual node card. | Node card expands showing full legal explanation and regulatory reference text. | **Pass** | Interactive card expansion. |

**Post-conditions:**
1. Deterministic evaluation matches mathematical logic without LLM hallucination.
2. Proof graph audit trail is visible to citizen and CSC operator.

---

### TC-05: Dynamic AcroForm Application Form Generation & Download

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Dynamic AcroForm Application Form Generation & Download | **Test Case #:** | TC-05 |
| **Subsystem:** | Smart PDF Form Generator & Action Plan | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the PDF generator merges citizen profile details into standard A4 government form templates with barcode, timestamp, and step-by-step submission checklist. | | |

**Pre-conditions:**
- Verified citizen profile exists (Ramesh Kumar, 45, Male, Punjab, Farmer).
- User is on scheme details or matches page.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Click 'Generate Pre-Filled Form' on PM-KISAN scheme card. | ActionPlanModal opens showing 3-step submission roadmap: 1. Download PDF, 2. Attach listed KYC documents, 3. Submit to nearest CSC center. | **Pass** | Action plan modal displayed. |
| 2 | Click 'Download Form (PDF)' button. | Browser dispatches POST request to /api/generate-pdf with { profile, schemeId: 'pm_kisan' }. | **Pass** | API trigger sent. |
| 3 | Inspect HTTP response headers. | Content-Type: application/pdf, Content-Disposition: attachment; filename="pm_kisan_application.pdf". HTTP 200 OK. | **Pass** | Header validation passed. |
| 4 | Open downloaded PDF file in PDF viewer. | PDF renders cleanly in A4 size with SchemeSaathi dark-green header, official government title, pre-filled citizen fields (Name, Age, Gender, State), declaration text, applicant signature box, and verification timestamp. | **Pass** | PDF visual layout confirmed. |

**Post-conditions:**
1. Downloaded PDF file size > 5 KB and fully compliant with PDF-1.7 specifications.
2. Application is automatically recorded in user's In-Progress applications list.

---

### TC-06: Scheme Application Submission & Lifecycle State Transitions

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Scheme Application Submission & Lifecycle State Transitions | **Test Case #:** | TC-06 |
| **Subsystem:** | Application Persistence & Lifecycle Tracker | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate the complete lifecycle of a welfare application from creation (DRAFT), submission (SUBMITTED), administrative scrutiny (UNDER_SCRUTINY), approval (APPROVED), through benefit disbursement (DISBURSED). | | |

**Pre-conditions:**
- User is on /matches or /chat.
- Scheme PM-SVANidhi selected.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | In Action Plan modal, click 'Submit Application Online'. | System generates unique tracking ID: SS-2026-XXXX, creates application record in /api/applications with status 'SUBMITTED', and displays reference card. | **Pass** | Application record created. |
| 2 | Click 'Track Application' link -> Navigates to /track?id=SS-2026-XXXX. | Tracking page displays application details (Scheme: PM-SVANidhi, Applicant Name, Submission Date: Current Date). | **Pass** | Tracker loaded. |
| 3 | Inspect Milestone Timeline stepper. | Stepper shows Step 1: 'Application Submitted' (Green checkmark, Completed); Step 2: 'Document Verification' (In Progress); Steps 3-5 (Pending). | **Pass** | Milestone timeline rendered. |
| 4 | Advance status to 'UNDER_SCRUTINY' via CSC Operator mode. | Timeline marks Document Verification as complete and highlights Field Inspection. | **Pass** | State advance verified. |
| 5 | Advance status to 'APPROVED'. | Status badge switches to green 'Approved'; sanction notice download button becomes enabled. | **Pass** | Sanction phase reached. |
| 6 | Refresh browser page. | Application record and updated status persist cleanly from backend storage. | **Pass** | Persistence confirmed. |

**Post-conditions:**
1. Application record is saved in data/applications.json and localStorage.
2. Milestone history logs timestamps and remarks for each transition.

---
