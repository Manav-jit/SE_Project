# TASK-07: Comprehensive Hindi/English UI Localization

## Objective
Implement system-wide bilingual localization (English and Hindi) so that the entire platform (Landing Page, Wizard, Matches, Categories, Dashboard, Modals, Action Plans, and Tracker) can be toggled smoothly between English and Hindi.

## Key Deliverables
1. **Localization Context & Dictionary (`src/lib/i18n/context.tsx` & `src/lib/i18n/translations.ts`)**:
   - Provide standard translations for all UI strings, buttons, modal titles, sector names, and instructions:
     - Navigation: "Saved Schemes" (सुरक्षित योजनाएं), "Open Chat" (बातचीत शुरू करें), "Quick Wizard" (त्वरित विज़ार्ड), "Track Status" (स्थिति ट्रैक करें).
     - Hero: "India's Friendliest Welfare Portal" (भारत का सबसे सुगम कल्याणकारी पोर्टल).
     - Form & Wizard labels, category headers, action buttons ("Get PDF" -> "पीडीएफ प्राप्त करें", "Verify Proof" -> "पात्रता प्रमाण जांचें").
2. **Persistent Language Selector**:
   - Shared language toggle component (`src/components/LanguageToggle.tsx`) placed in the global header and accessible from every page.
   - Saves language preference in storage and syncs across views.
3. **Component Updates**:
   - Wrap interactive pages in the language context and bind dynamic text tokens.

## Verification
- Toggle between English and Hindi from the header on any page.
- Ensure all pages (Home, Wizard, Matches, Dashboard, Categories, Modals) reflect translated strings.
- Verify build passes.
