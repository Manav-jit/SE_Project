# TASK-08: PWA & Offline Connectivity Resilience

## Status: COMPLETED

## Objective
Configure SchemeSaathi as an installable Progressive Web App (PWA) with offline caching so rural and semi-urban citizens with intermittent internet can browse cached welfare schemes, view required documents, and check eligibility rules offline.

## Key Deliverables
1. **Web App Manifest (`public/manifest.json`)**:
   - PWA configuration (name: SchemeSaathi, theme color #2D4A22, background #FDFBF7, standalone display, svg maskable icon).
2. **Service Worker (`public/sw.js`)**:
   - Offline asset and API cache strategy: Pre-caches shell assets, Stale-While-Revalidate for static resources, and Network-First with cache fallback for `/api/schemes` responses so offline users can still browse schemes.
3. **Offline Indicator & Service Worker Registration (`src/components/OfflineIndicator.tsx`)**:
   - Registers service worker in production.
   - Monitors online/offline network events.
   - Displays a non-intrusive offline status banner when `navigator.onLine === false`.
4. **Layout Integration (`src/app/layout.tsx`)**:
   - Configured `manifest` and viewport `themeColor`.
   - Injected `<OfflineIndicator />`.

## Verification
- Verified: `npm run lint` exited 0 (0 errors, 0 warnings).
- Verified: `npm run build` compiled all routes successfully.
