# TASK-05: Application Database & Storage Persistence

## Objective
Implement a persistent storage layer and REST API (`/api/applications`) so that citizen application submissions, generated forms, and profile history are saved permanently rather than only residing in ephemeral browser state.

## Key Deliverables
1. **Application Storage Model (`src/lib/storage/applications.ts`)**:
   - Define schema for `SubmittedApplication`:
     - `id`: Unique application reference number (e.g. `SS-2026-XXXX`)
     - `schemeId`: ID of the welfare scheme
     - `schemeName`: Official scheme title
     - `applicantName`: Name of the applicant
     - `submissionDate`: ISO timestamp
     - `status`: `'SUBMITTED' | 'UNDER_VERIFICATION' | 'FIELD_INSPECTION' | 'SANCTIONED' | 'DISBURSED'`
     - `actionChecklist`: Step-by-step progress tracking
     - `notes`: Instructions and CSC submission details
   - Provide file-system persistence (in `data/applications.json`) for server-side persistence with fallback client storage.
2. **REST API Endpoints**:
   - `GET /api/applications`: Retrieve list of submitted applications.
   - `POST /api/applications`: Create a new application submission when a citizen downloads/submits an application.
   - `PATCH /api/applications`: Update application status or milestone progress.
3. **Integration with ActionPlanModal**:
   - When a user downloads a PDF in `ActionPlanModal.tsx`, automatically register an application in the system and return their official Reference Tracking ID.

## Verification
- Test creating an application via `ActionPlanModal`.
- Verify the application persists and is returned by `GET /api/applications`.
