# SchemeSaathi: System Test Case Specification
**Document Code**: Doc: T_01  
**Standard Template**: Dr. Ghazy Assassa Test Case Specification Standard  
**System**: SchemeSaathi (AI-Powered Citizen Welfare Discovery Platform)  
**Date**: 20 November 2026 | **Version**: 2.0 | **Status**: Verified  

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

## 2. Test Suite & Traceability Matrix

| Test # | Subsystem | Test Case Name | Type | Priority | Status |
|---|---|---|---|---|---|
| **TC-01** | AI Chat & Discovery | Guided Citizen Profile Elicitation via Natural Language | Positive | High | 🟢 Pass |
| **TC-02** | AI Chat & Discovery | Contradictory Input Sanitization & Hindi Language Switching | Boundary / Neg | High | 🟢 Pass |
| **TC-03** | Quick-Match Wizard | 3-Step Wizard Linear Flow for Scheme Recommendation | Functional | High | 🟢 Pass |
| **TC-04** | Quick-Match Wizard | Wizard Mandatory Field Validation & Backward Traversal | Boundary / State | Medium | 🟢 Pass |
| **TC-05** | DigiLocker eKYC | End-to-End Mock DigiLocker Authentication & Identity Injection | Security / eKYC | High | 🟢 Pass |
| **TC-06** | DigiLocker eKYC | DigiLocker OTP Timeout & Invalid Security PIN Validation | Exception | Medium | 🟢 Pass |
| **TC-07** | RAG & Recommendation | Semantic Embedding Search & Multi-Criteria Ranking | Algorithmic | High | 🟢 Pass |
| **TC-08** | RAG & Recommendation | Out-of-Scope Profile Filtering & Zero-Match Handling | Boundary | Medium | 🟢 Pass |
| **TC-09** | DAG Eligibility Engine | Deterministic Rule Evaluation & Visual Proof Graph Rendering | Verification | High | 🟢 Pass |
| **TC-10** | DAG Eligibility Engine | Ineligible Scheme Counterfactual Path Exploration (What-If) | Analytical | High | 🟢 Pass |
| **TC-11** | Smart PDF Generator | Dynamic AcroForm Application Form Generation & Download | Document Gen | High | 🟢 Pass |
| **TC-12** | Smart PDF Generator | PDF Generation Exception Handling for Missing Scheme ID | API Validation | Medium | 🟢 Pass |
| **TC-13** | Lifecycle Tracker | Scheme Application Submission & Lifecycle State Transitions | End-to-End | High | 🟢 Pass |
| **TC-14** | Lifecycle Tracker | Tracking Search Query with Non-Existent Reference ID | Exception | Medium | 🟢 Pass |
| **TC-15** | OCR & Pre-Scrutiny | Aadhaar / Ration Client-Side OCR & DBT Pre-Scrutiny | OCR / Scrutiny | High | 🟢 Pass |
| **TC-16** | Accessibility & i18n | Sovereign GIGW Accessibility Toolbar & Multilingual Toggle | A11y / Compliance | High | 🟢 Pass |

---

## 3. Comprehensive SchemeSaathi Test Case Specifications

### TC-01: Guided Citizen Profile Elicitation via Natural Language Chat

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Guided Citizen Profile Elicitation via Natural Language Chat | **Test Case #:** | TC-01 |
| **Subsystem:** | AI Chat & Conversational Discovery | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the AI Chat interface accurately extracts demographic attributes (occupation, landholding size, state) from free-form citizen conversational inputs and updates the real-time dossier with eligible scheme matches. | | |

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

### TC-02: Contradictory Input Sanitization & Hindi Language Switching

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Contradictory Input Sanitization & Hindi Language Switching | **Test Case #:** | TC-02 |
| **Subsystem:** | AI Chat & Conversational Discovery | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the AI Chat copilot handles invalid/contradictory demographic inputs (age > 120, negative income) by sanitizing inputs, and seamlessly transitions conversation to Hindi upon language toggle selection. | | |

**Pre-conditions:**
- Citizen is active on the /chat route.
- Profile state exists with standard default values.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Enter prompt: 'My age is 150 and my annual income is -50000 rupees.' and click Send. | System sanitizes input; age > 120 and negative income are rejected by /api/chat sanitizer. Dossier leaves age and income uncorrupted. | **Pass** | Sanitizer guard active. |
| 2 | Verify AI conversational response. | AI responds courteously noting that the age and income values appear anomalous and prompts citizen for valid details. | **Pass** | Conversational fallback rule triggered. |
| 3 | Click Language Toggle button in top bar, selecting 'हिंदी' (Hindi). | Language context switches to 'hi'. Header and chat UI elements localize to Hindi. | **Pass** | i18n context event dispatched. |
| 4 | Enter prompt in Hindi: 'मुझे फसल ऋण और कृषि सब्सिडी की जानकारी चाहिए।' and click Send. | Request sends with { language: 'hi' }. AI copilot streams response entirely in Hindi detailing PM-KISAN and KCC benefits. | **Pass** | Multilingual prompt instruction enforced. |
| 5 | Verify post-conditions. | No corrupted demographic values stored; Hindi dialogue preserved in conversation history. | **Pass** | Robustness confirmed. |

**Post-conditions:**
1. Profile holds no invalid demographic values (age <= 120, income >= 0).
2. Active session language preference is saved as 'hi' in context.

---

### TC-03: 3-Step Wizard Linear Flow for Scheme Recommendation

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | 3-Step Wizard Linear Flow for Scheme Recommendation | **Test Case #:** | TC-03 |
| **Subsystem:** | Quick-Match Wizard | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the 3-step Quick-Match Wizard successfully collects age, gender, occupation, caste category, and state, smoothly advancing through progress milestones to matched results. | | |

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

### TC-04: Wizard Mandatory Field Validation & Backward Traversal

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Wizard Mandatory Field Validation & Backward Traversal | **Test Case #:** | TC-04 |
| **Subsystem:** | Quick-Match Wizard | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Ensure boundary validation prevents skipping required fields and backward navigation ('Previous Step') preserves previously entered data without reset. | | |

**Pre-conditions:**
- User is on http://localhost:3000/wizard at Step 1.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Leave Age field blank and click 'Next Step'. | System prevents step advance or defaults safely without runtime exception; focuses on age input. | **Pass** | Client validation verified. |
| 2 | Enter Age: '22', select Gender: 'Male', and click 'Next Step'. | Wizard advances smoothly to Step 2. | **Pass** | Step advance permitted. |
| 3 | Select Occupation: 'Student'. Click 'Next Step' to advance to Step 3. | Wizard advances to Step 3. | **Pass** | Step 2 data recorded. |
| 4 | Click 'Previous Step' button on Step 3. | Wizard navigates back to Step 2; Occupation remains selected as 'Student' (not reset). | **Pass** | Backward state preservation verified. |
| 5 | Change Occupation from 'Student' to 'Laborer' and click 'Next Step'. | Wizard advances to Step 3 with updated occupation value. | **Pass** | State mutation verified. |
| 6 | Verify post-conditions. | Profile in memory contains occupation: 'Laborer'. | **Pass** | Verified. |

**Post-conditions:**
1. Profile state accurately retains mutated values across backward and forward transitions.

---

### TC-05: End-to-End Mock DigiLocker Authentication & Identity Injection

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | End-to-End Mock DigiLocker Authentication & Identity Injection | **Test Case #:** | TC-05 |
| **Subsystem:** | DigiLocker eKYC Integration | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the 5-step mock DigiLocker OAuth flow authenticates the citizen, verifies credentials via OTP, gathers document consent, and injects verified Aadhaar/Ration details into the user profile. | | |

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

### TC-06: DigiLocker OTP Timeout & Invalid Security PIN Validation

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | DigiLocker OTP Timeout & Invalid Security PIN Validation | **Test Case #:** | TC-06 |
| **Subsystem:** | DigiLocker eKYC Integration | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify system behavior when invalid credentials or expired OTP are submitted during the DigiLocker verification flow. | | |

**Pre-conditions:**
- DigiLockerModal is open at Step 1: Credentials.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Enter a 3-digit PIN '123' into the 6-digit PIN input and click 'Sign In'. | Inline validation triggers: 'Security PIN must be 6 digits'; submit action is blocked. | **Pass** | Input length validation active. |
| 2 | Enter valid PIN '123456', click 'Sign In' to reach Step 2 (OTP). | Advances to OTP step; timer starts at 45s. | **Pass** | OTP step entered. |
| 3 | Enter incorrect OTP '000000' and click 'Verify OTP'. | Error alert appears: 'Invalid OTP. Please enter 123456 for demo verification'; user remains on OTP step. | **Pass** | Incorrect OTP trapped. |
| 4 | Wait for countdown timer to reach 00:00. | Countdown stops at 00:00; UI indicates OTP has expired; 'Resend OTP' button becomes active. | **Pass** | Timer expiration handled. |
| 5 | Click 'Resend OTP'. | Timer resets to 45s; error alert clears; new OTP cycle begins. | **Pass** | Resend flow functional. |

**Post-conditions:**
1. Citizen profile remains unverified (verified: false).
2. No invalid tokens or mock credentials are written to storage.

---

### TC-07: Semantic RAG Vector Retrieval & Multi-Criteria Ranking

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Semantic RAG Vector Retrieval & Multi-Criteria Ranking | **Test Case #:** | TC-07 |
| **Subsystem:** | RAG Scheme Retrieval & Recommendation Engine | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the in-memory RAG retriever computes embedding cosine similarity and applies multi-attribute filters to rank relevant welfare schemes. | | |

**Pre-conditions:**
- Scheme catalog loaded from /data/schemes/ (20 schemes).
- In-memory embedding vector cache initialized via src/lib/rag/embeddings.ts.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Dispatch GET request to /api/schemes?profile={"occupation":"farmer","state":"Punjab","landHoldingHectares":1.5}. | Server invokes findRelevantSchemes with the farmer demographic profile. | **Pass** | Endpoint reachable. |
| 2 | Inspect ranked scheme results in API JSON response. | PM-KISAN, PM Fasal Bima Yojana, and Rythu Bandhu / agricultural schemes are returned in top ranks with match confidence scores > 80%. | **Pass** | Cosine similarity verified. |
| 3 | Inspect excluded schemes in the response payload. | Schemes restricted exclusively to students (National Merit Scholarship) or urban street vendors (PM-SVANidhi) are down-ranked or filtered. | **Pass** | Multi-criteria filtering active. |
| 4 | Inspect scheme payload schema. | Every scheme object contains id, name, category, benefits, documents_required, and application_process. | **Pass** | JSON contract verified. |

**Post-conditions:**
1. HTTP response code is 200 OK.
2. Returned schemes list is strictly sorted in descending order of relevance score.

---

### TC-08: Out-of-Scope Profile Filtering & Zero-Match Handling

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Out-of-Scope Profile Filtering & Zero-Match Handling | **Test Case #:** | TC-08 |
| **Subsystem:** | RAG Scheme Retrieval & Recommendation Engine | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify system resilience and user feedback when citizen demographic criteria match no active government welfare schemes. | | |

**Pre-conditions:**
- User accesses Scheme Explorer or Matches page.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Submit profile with Income: '₹1,00,00,000' (1 Crore INR), Occupation: 'Corporate Executive', Landholding: '0'. | Backend RAG engine filters out all means-tested welfare schemes (BPL, EWS, Farmer, Laborer subsidies). | **Pass** | Strict income threshold check. |
| 2 | Inspect UI display on /matches. | Zero-state banner renders cleanly: 'No direct welfare schemes matched your high-income tier. Browse universal public services or tax incentives.' | **Pass** | Empty state UX validated. |
| 3 | Click 'Browse All Categories' button. | Navigates to /categories allowing manual exploration of universal programs without app crash. | **Pass** | Graceful recovery flow. |

**Post-conditions:**
1. System produces zero false-positive eligibility claims.
2. No unhandled null-reference exceptions in React rendering pipeline.

---

### TC-09: Deterministic DAG Rule Evaluation & Visual Proof Graph Rendering

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Deterministic DAG Rule Evaluation & Visual Proof Graph Rendering | **Test Case #:** | TC-09 |
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

### TC-10: Ineligible Scheme Counterfactual Path Exploration (What-If)

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Ineligible Scheme Counterfactual Path Exploration (What-If) | **Test Case #:** | TC-10 |
| **Subsystem:** | Eligibility Proof Graph (DAG) Engine | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that when a citizen fails an eligibility criterion, the DAG identifies the exact failing leaf node and generates actionable counterfactual guidance. | | |

**Pre-conditions:**
- Citizen profile has { occupation: 'farmer', landHoldingHectares: 3.5, state: 'Punjab' } (exceeds 2.0 ha ceiling).
- User opens Proof Graph for PM-KISAN.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Open Proof Graph Modal for PM-KISAN. | Overall verdict displays red badge: 'VERDICT: INELIGIBLE'. | **Pass** | Ineligible verdict confirmed. |
| 2 | Inspect failing node in the visual tree. | Node 'landHoldingHectares <= 2.0' is highlighted in amber/red with an alert icon: Actual: 3.5 ha | Required: <= 2.0 ha. | **Pass** | Failing node isolated. |
| 3 | Scroll to 'How You Can Become Eligible' (Counterfactual Section). | Counterfactual card renders: 'Parameter Delta: Your land holding is 1.5 hectares above the small/marginal farmer limit. If your land holding was 2.0 hectares or less, or if parcel title is subdivided among legal heirs, you would become eligible for ₹6,000/year.' | **Pass** | Counterfactual text generated. |
| 4 | Verify alternate scheme recommendations. | System recommends PM Tractor Scheme or Farm Mechanization Subsidy permitting larger landholdings. | **Pass** | Alternate routing verified. |

**Post-conditions:**
1. Clear diagnostic explanation provided to user without bureaucratic jargon.
2. Counterfactual delta is computed accurately: 3.5 - 2.0 = 1.5 ha.

---

### TC-11: Dynamic AcroForm Application Form Generation & Download

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Dynamic AcroForm Application Form Generation & Download | **Test Case #:** | TC-11 |
| **Subsystem:** | Smart PDF Form Generator & Action Plan | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the PDF generator merges citizen profile details into standard A4 government form templates with barcode, timestamp, and step-by-step checklist. | | |

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

### TC-12: PDF Generation Exception Handling for Missing Scheme ID

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | PDF Generation Exception Handling for Missing Scheme ID | **Test Case #:** | TC-12 |
| **Subsystem:** | Smart PDF Form Generator & Action Plan | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the PDF generator API validates incoming payloads and gracefully rejects malformed requests without crashing the server. | | |

**Pre-conditions:**
- API test client (fetch / curl) connected to /api/generate-pdf.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Dispatch POST request to /api/generate-pdf with empty JSON payload {}. | Server catches missing schemeId parameter. | **Pass** | Request payload validated. |
| 2 | Inspect response HTTP status code. | Status code is 400 Bad Request. | **Pass** | HTTP 400 verified. |
| 3 | Inspect JSON error message. | Response body contains { "error": "Missing schemeId" }. | **Pass** | Error message contract verified. |
| 4 | Dispatch POST with invalid scheme ID { "schemeId": "unknown_scheme_99" }. | Server falls back gracefully to standard generic welfare application template without unhandled crash. | **Pass** | Fallback handling verified. |

**Post-conditions:**
1. Server logs request error without unhandled exception crashes.
2. No orphaned file descriptors or memory leaks created.

---

### TC-13: Scheme Application Submission & Lifecycle State Transitions

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Scheme Application Submission & Lifecycle State Transitions | **Test Case #:** | TC-13 |
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

### TC-14: Tracking Search Query with Non-Existent Reference ID

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Tracking Search Query with Non-Existent Reference ID | **Test Case #:** | TC-14 |
| **Subsystem:** | Application Persistence & Lifecycle Tracker | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the tracking portal displays an informative error message when queried with an invalid or non-existent Reference ID. | | |

**Pre-conditions:**
- User navigates to http://localhost:3000/track.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | In tracking search bar, enter invalid ID: 'SS-0000-INVALID' and click 'Track Status'. | System initiates lookup to /api/applications?id=SS-0000-INVALID. | **Pass** | API lookup dispatched. |
| 2 | Inspect UI response. | Search spinner resolves; error banner displays: 'No application found for Reference ID "SS-0000-INVALID". Please check the ID or select from recent submissions.' | **Pass** | Error banner rendered. |
| 3 | Inspect Quick Suggestions list below search bar. | System renders list of recently submitted valid application IDs for one-click selection. | **Pass** | Recovery links displayed. |
| 4 | Click on a suggested valid ID (e.g. 'SS-2026-1042'). | Search input updates; application record for SS-2026-1042 loads instantly with full timeline. | **Pass** | Suggestion click-through verified. |

**Post-conditions:**
1. Application state handles 404 cleanly without blank screen or uncaught promise rejection.

---

### TC-15: Aadhaar / Ration Client-Side OCR & DBT Pre-Scrutiny

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Aadhaar / Ration Client-Side OCR & DBT Pre-Scrutiny | **Test Case #:** | TC-15 |
| **Subsystem:** | OCR Document Scanner & Scrutiny Engine | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Validate that the client-side OCR engine extracts text from uploaded identity documents, performs fuzzy name matching against the profile, and flags Direct Benefit Transfer (DBT) mismatch risks. | | |

**Pre-conditions:**
- User opens DocumentScannerModal from chat or dossier.
- Profile has Name: 'Rameshwar Singh'.

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Click 'Upload Document' and select sample Aadhaar card image. | Image preview renders; progress bar shows 'Reading document image (10%)... OCR extraction in progress (60%)...'. | **Pass** | Image loaded & parsed. |
| 2 | Wait for OCR processing completion. | OCR engine extracts Name: 'Rameshwar Singh', DOB: '15/08/1980', Gender: 'Male', Aadhaar: 'XXXX XXXX 4892'. | **Pass** | OCR text extraction verified. |
| 3 | Inspect DBT Pre-Scrutiny Badge. | Scrutiny engine computes Levenshtein distance between OCR name and profile name; score = 100%; badge displays green: 'DBT Name Match: 100% (Direct Benefit Transfer Safe)'. | **Pass** | Fuzzy match verified. |
| 4 | Edit extracted name to 'Ramishwar Singh' (intentional typo). | Scrutiny score adjusts to ~85% with warning: 'Minor spelling discrepancy detected. May require affidavit during bank verification.' | **Pass** | Real-time scrutiny scoring active. |
| 5 | Click 'Confirm & Update Profile'. | Extracted fields populate user profile; modal closes. | **Pass** | Profile updated. |

**Post-conditions:**
1. Profile holds verified document data and OCR match confidence score.

---

### TC-16: Sovereign GIGW Accessibility Toolbar & Multilingual Toggle

| Field | Value | Field | Value |
|---|---|---|---|
| **Test Case Name:** | Sovereign GIGW Accessibility Toolbar & Multilingual Toggle | **Test Case #:** | TC-16 |
| **Subsystem:** | UI / Accessibility & Localization (GIGW / WCAG 2.1 AA) | **System:** | SchemeSaathi |
| **Design Date:** | 20/11/2026 | **Designed by:** | QA Engineering Group |
| **Execution Date:** | 20/11/2026 | **Executed by:** | Automated CI / Test Lead |
| **Short Description:** | Verify that the accessibility toolbar supports high-contrast theme, font resizing, and screen-reader accessibility, while the language toggle translates all interface strings into Hindi. | | |

**Pre-conditions:**
- User is on SchemeSaathi home page (http://localhost:3000/).

| Step | Action | Expected System Response | Pass/Fail | Comment |
|---|---|---|---|---|
| 1 | Locate Accessibility Toolbar in header. Click 'A+' (Increase Text Size). | Root font size scales by +2pt across all headings, cards, and navigation links. | **Pass** | Font scaling verified. |
| 2 | Click 'Contrast' toggle button (High Contrast Mode). | Theme switches to high-contrast sovereign mode: dark background (#121212), pure white text (#FFFFFF), and high-visibility yellow/lime accents (#FBBF24). Contrast ratio >= 7:1. | **Pass** | High contrast active. |
| 3 | Click Language Toggle button, switching from 'English' to 'हिंदी'. | Navigation bar switches to 'योजनाएं खोजें', 'डैशबोर्ड', 'आवेदन ट्रैक करें'; hero headline switches to 'अपनी सरकारी योजनाएं खोजें'. | **Pass** | System-wide i18n switch verified. |
| 4 | Navigate to /categories. | Category cards render localized titles: 'कृषि एवं ग्रामीण विकास', 'स्वास्थ्य एवं परिवार कल्याण', 'शिक्षा एवं छात्रवृत्ति'. | **Pass** | Category localization verified. |
| 5 | Verify post-conditions. | Accessibility and language preferences persist across page navigation. | **Pass** | Verified. |

**Post-conditions:**
1. WCAG 2.1 AA compliance standards for contrast and font resizing are maintained.
2. Language preference is saved in context.

---
