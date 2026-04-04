# CityHealth — Replit Project

## Overview
CityHealth is a digital health platform for Sidi Bel Abbès, Algeria. It helps citizens find and connect with healthcare providers (hospitals, clinics, doctors, pharmacies, laboratories) via an interactive map, search, and an AI health assistant.

## Architecture
- **Type**: Pure frontend Single Page Application (SPA)
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Routing**: React Router v6
- **State**: TanStack Query + Zustand + React Context

## Backend Services
- **Firebase** (primary): Authentication, Firestore database, Cloud Storage, Cloud Functions
- **Supabase**: Edge functions for AI chat (chat-with-pdf, map-bot, symptom-triage, public API)
- No Express/Node server — all backend is handled by Firebase/Supabase

## Development
- Run: `npm run dev` (starts Vite dev server on port 5000)
- Build: `npm run build`
- Package manager: bun (bun.lock present)

## Key Directories
- `src/` — main React app
  - `components/` — UI components (map, admin, citizen, provider, etc.)
  - `pages/` — route-level page components
  - `services/` — Firebase/Supabase API logic
  - `contexts/` — AuthContext, LanguageContext, ThemeContext, ProviderContext
  - `hooks/` — custom React hooks
  - `lib/firebase.ts` — Firebase initialization
  - `integrations/supabase/client.ts` — Supabase client
- `supabase/` — Edge function source code (Deno) and SQL migrations
- `firebase-functions/` — Firebase Cloud Function source

## Environment Variables
The app uses these env vars (set as Replit secrets):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- Firebase config is hardcoded in `src/lib/firebase.ts` (Firebase keys are safe for client-side use per Firebase docs)

## Replit Migration Notes
- Migrated from Lovable to Replit April 2026
- Removed `lovable-tagger` Vite plugin (Lovable-only)
- Changed Vite server port from 8080 to 5000 (Replit webview requirement)
- Set `allowedHosts: true` for Replit proxy compatibility
