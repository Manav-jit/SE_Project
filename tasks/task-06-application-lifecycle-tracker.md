# TASK-06: Application Lifecycle & Status Tracker

## Objective
Create a dedicated citizen tracking portal (`/track` and integrated into `/dashboard`) allowing beneficiaries to look up their application reference number (e.g., `SS-2026-1042`), view milestone progress, simulate government verification stages, and download receipt slips.

## Key Deliverables
1. **Application Tracking Page (`src/app/track/page.tsx` & `TrackClient.tsx`)**:
   - Reference Number Search input.
   - Visual Horizontal/Vertical Timeline with 5 status stages:
     1. Application Submitted (with timestamp & CSC acknowledgment)
     2. Document Scrutiny by Block Development Officer
     3. Field Verification by Gram Sevak / Municipal Officer
     4. Sanction Order Issued
     5. DBT Benefit Disbursed to Bank Account
   - Stage progress indicators, status badges, and download receipt button.
2. **Dashboard Integration**:
   - New "My Applications" tab in `/dashboard` displaying all active citizen submissions with live status cards.
3. **Status Simulator (for demo/review)**:
   - Allow users/evaluators to advance stages (e.g. "Simulate Approval" or "Advance Stage") to demonstrate the complete lifecycle.

## Verification
- Search for a valid reference ID.
- Verify status timeline renders correctly.
- Verify advancement updates persisted application state.
