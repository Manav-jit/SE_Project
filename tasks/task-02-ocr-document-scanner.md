# TASK-02: Client-Side Document OCR Scanner

## Objective
Replace the mock timer-based document upload in the chat interface with a real client-side OCR & document recognition engine that parses uploaded identity documents (Aadhaar cards, Ration cards, or voter IDs) and extracts demographic fields (Name, Date of Birth/Age, Gender, ID number) directly into the user's active profile.

## Key Deliverables
1. **OCR Processing Engine (`src/lib/ocr/parser.ts`)**:
   - Utilize client-side canvas/image-processing with regex heuristic matching for Indian identification documents (Aadhaar 12-digit format `\d{4}\s\d{4}\s\d{4}`, DOB/Year of Birth detection `\d{2}/\d{2}/\d{4}` or `DOB: \d{4}`, Gender keywords `Male|Female|Transgender`, and Name recognition).
   - Support image file upload (PNG, JPEG, WebP) with a preview modal.
2. **Document Upload Modal & Scanner Component (`src/components/DocumentScannerModal.tsx`)**:
   - Camera capture or file upload interface.
   - Real-time progress bar (e.g. Loading OCR Engine -> Analyzing Document -> Extracting Fields -> Verified).
   - Extracted data review step where the citizen can confirm or correct parsed values before injecting into the profile.
3. **Chat Integration**:
   - Connect the paperclip button in `ChatInput.tsx` to open the scanner modal.
   - On confirmation, dispatch profile update event and notify the assistant message stream.

## Verification
- Upload test sample document or image.
- Verify demographic fields auto-populate in profile state without hardcoding.
- Verify build succeeds cleanly.
