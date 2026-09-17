# Future Plan: SchemeSaathi (Phases 4, 5, & 6)

The MVP has been implemented up to Phase 3, enabling the core feature: **AI-Powered Scheme Discovery**. The user can chat with the AI, which incrementally extracts their profile and recommends relevant government welfare schemes (from the curated JSON list) based on eligibility criteria using an in-memory RAG pipeline.

The following phases are planned for the future to complete the application.

## Phase 4: Mock DigiLocker Integration

**Goal:** Simplify onboarding and increase trust by simulating an official identity verification flow.

- **Mock OAuth Flow:** Build a `DigiLockerModal.tsx` that simulates a connection to DigiLocker.
- **Data Injection:** Instead of making the user type out everything, the mock flow will inject verified identity data (Name, Aadhaar Number, DOB, Gender, Address) directly into the `UserProfile` state.
- **UI Updates:** Add a "Verified ✓" badge next to data points sourced from DigiLocker in the sidebar.

## Phase 5: PDF Document Generator (The "Smart Preparation Engine")

**Goal:** Bridge the final mile of the application process by generating perfectly pre-filled government application forms.

- **PDF Templates:** Source or recreate blank PDF forms for the supported schemes (e.g., `pm_kisan_form.pdf`) and place them in `data/templates/`.
- **Fill Engine:** Implement `src/lib/pdf/generator.ts` using `pdf-lib`. It will map the `UserProfile` fields to the specific AcroForm field names in the PDF templates.
- **Generation API:** Create `/api/generate-pdf/route.ts` to receive the scheme ID and profile, and return a downloadable, filled PDF.
- **Action Plan UI:** When the user clicks "Generate Form", present a modal with the download link and a step-by-step checklist of exactly where to submit the document.

## Phase 6: Dashboard & Polish

**Goal:** Elevate the application to a production-ready, premium experience.

- **Persistent Dashboard:** Update `page.tsx` to remember and display "My Matched Schemes" from previous chat sessions.
- **Analytics & History:** Show quick stats (schemes found, forms generated) and a preview of recent chat history.
- **Scheme Detail View:** Create a comprehensive `SchemeDetailModal.tsx` showing the full breakdown of benefits, eligibility, and required documents.
- **Micro-interactions:** Add layout transitions, hover states, and loading skeletons to the UI.
- **Responsive Design:** Ensure all components (especially the chat sidebar and modals) render perfectly on mobile devices.
- **Final QA:** End-to-end testing of the complete user journey.
