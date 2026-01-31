# CyberSec Arena — Site Overview

This overview consolidates the architecture, frontend and backend modules, algorithms, tools, features, build/run instructions, testing guidance, security considerations, and extension points for the CyberSec Arena project.

> See the in-repo documentation index for deeper guides: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

## 1. Project Summary
- Purpose: Gamified cybersecurity learning platform with CTF challenges, phishing practice, code hardening, quizzes, tools, and a badge/achievement system.
- Platforms: Web SPA (React + TypeScript) and optional Electron desktop package.

## 2. Technology Stack
- Frontend: React 18 (TypeScript), Vite, Tailwind CSS, lucide-react
- Backend / Dev Server: Node.js (`dev-server.js`) for local proxies and dev-only endpoints; Supabase for production persistence (optional)
- Build tools: Vite (esbuild), ESLint, TypeScript, PostCSS/Tailwind
- Key files: `package.json`, `dev-server.js`, `src/App.tsx`, `src/components/Layout.tsx`

## 3. Frontend Architecture & Modules
- Routing & pages: `src/App.tsx` defines public and protected routes, lazy-loaded pages (Dashboard, CTF, PhishHunt, CodeAndSecure, AI Quiz Bot, Leaderboard, Steganography, ThreatRadar, News, Profile, Tutorials).
- Layout: `src/components/Layout.tsx` implements sidebar nav groups, prefetch map, and global UI chrome (Matrix background, Achievement queue, AICoach).
- Authentication: `src/contexts/AuthContext` + `ProtectedRoute` / `PublicRoute` wrappers.
- Progress & Badges: `src/lib/progress.tsx` (provider + hooks), `src/services/BadgeService.ts`, `src/services/ProgressCalculationService.ts`.
- Tools: Prototypes and components may live under `src/components/tools` (Metadata Scrubber, IP Tools, Ping Simulator). Search the folder for current implementations.

## 4. Backend, Storage & Services
- Storage abstraction: `IProgressStorage` with local and Supabase implementations. Runtime selection via `config/storage.ts`.
- Dev server: `dev-server.js` used for local helper endpoints and to proxy API requests that require server-side keys.
- Server responsibilities: WHOIS and sensitive integrations should be proxied by the server to avoid exposing API keys and to handle CORS restrictions.

## 5. Algorithms & Core Logic
- Badge engine: Rule-based evaluator in `BadgeService` that awards badges based on event thresholds and sequences.
- Score & leaderboard: Computed by `ProgressCalculationService`, normalized across activity types.
- Adaptive quizzes: `QuizDifficultyAdapter` adjusts question difficulty based on past performance.
- Prefetching: `Layout` uses a small prefetch map to dynamically import route chunks on hover/focus.
- Realtime sync: Debounced syncing (`~500ms`) of progress to leaderboard to prevent excessive writes.

## 6. Implemented Tools & Prototypes (Summary)
- Achievement system (complete): visual/sonic feedback using animations and WebAudio.
- Steganography studio: page and utilities for embedding/extracting payloads.
- Threat Radar: integrates public threat feeds and heuristics to show alerts.
- IP & metadata tools (prototypes): IP geolocation, CIDR calculator, Metadata Scrubber (PDF/image strip), Ping simulator — some were prototyped and may need to be restored if removed.

## 7. Build & Run
- Dev frontend: `npm run dev`
- Dev backend helper: `npm run dev:backend`
- Full dev (both): `npm run dev:full`
- Production build: `npm run build` then `npm run preview`
- Desktop mode: `npm run dev:desktop` (Electron)

## 8. Configuration
- Sensitive keys: keep Supabase and third-party API keys in environment variables or a secure server. Refer to `SUPABASE_SETUP.md` and `BACKEND_SETUP.md`.

## 9. Testing & QA
- Unit tests: focus on services (BadgeService, ProgressCalculationService) with mocked storage.
- Integration: use `dev-server.js` to simulate/proxy external APIs for end-to-end flows.
- Manual QA: run test scenarios in `BADGE_ANIMATIONS_TESTING.md`.

## 10. Security & Privacy
- Proxy any API requiring a secret; do not embed keys in browser code.
- Ask for explicit permissions for device geolocation and explain the source of location data (device vs IP).
- Metadata tools operate client-side by default; avoid uploading files without explicit consent.

## 11. Extensibility & Adding Tools
1. Add UI component under `src/components/tools` and page under `src/pages`.
2. Add lazy-page import and route to `src/App.tsx`.
3. Add nav entry in `src/components/Layout.tsx`.
4. If API keys are required, add server proxy in `dev-server.js` and document keys in `BACKEND_SETUP.md`.
5. Add documentation to `DOCUMENTATION_INDEX.md` and testing steps to `BADGE_ANIMATIONS_TESTING.md`.

## 12. Quick File Map
- [src/App.tsx](src/App.tsx) — routing
- [src/components/Layout.tsx](src/components/Layout.tsx) — layout & nav
- [src/lib/progress.tsx](src/lib/progress.tsx) — progress provider & hooks
- [src/services](src/services) — business logic services
- [dev-server.js](dev-server.js) — dev helpers and proxies
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — documentation index

---

If you'd like, I can now:
- generate a single `SITE_OVERVIEW.md` export (already created), or
- replace/merge it into the existing `COMPREHENSIVE_SITE_DOCUMENTATION.md`, or
- run the dev server and perform a smoke test of core pages.

Which would you like next?