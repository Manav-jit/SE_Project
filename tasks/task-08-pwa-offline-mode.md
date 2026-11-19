# TASK-08: PWA & Offline Connectivity Resilience

## Objective
Configure SchemeSaathi as an installable Progressive Web App (PWA) with offline caching so rural and semi-urban citizens with intermittent internet can browse cached welfare schemes, view required documents, and check eligibility rules offline.

## Key Deliverables
1. **Web App Manifest (`public/manifest.json`)**:
   - PWA configuration (name: SchemeSaathi, theme color, background color, icons, display: standalone, orientation: portrait).
2. **Service Worker (`public/sw.js`)**:
   - Offline asset and API cache strategy: Cache essential static bundles, fonts, icons, and cache `/api/schemes` responses so offline users can still browse schemes.
3. **Offline Indicator & Service Worker Registration (`src/components/PWAInstallPrompt.tsx` or layout hook)**:
   - Registers service worker in `layout.tsx`.
   - Displays a non-intrusive offline status banner when `navigator.onLine === false`.

## Verification
- Test service worker registration in browser.
- Verify manifest validity.
- Verify `npm run build` succeeds.
