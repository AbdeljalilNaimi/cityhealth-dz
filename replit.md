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

## Content System Architecture (April 2026)

### Annonces vs Publications
The `ads` table uses a `type` column to distinguish two separate content systems:

- **Annonces** (`type = 'annonce'`): Provider-created posts (Titre, Description courte ≤200, Description complète, Date d'expiration). Direct publish — no admin approval. Appear only on the provider's public profile under the `Annonces` section. Managed via `ProviderAdsManager` in the dashboard `Annonces` tab.
- **Publications** (`type = 'publication'`): Rich content (Titre, Catégorie, Résumé, Contenu, Mots-clés, DOI, PDF, Image). Require admin approval. Appear in `/annonces` public page after approval. Managed in the dashboard `Mes Publications` tab.

### Key files
- `src/components/ads/ProviderAdsManager.tsx` — Annonces dashboard form & list
- `src/components/ads/ProviderAnnoncesPublic.tsx` — Public view on provider profile
- `src/services/adsService.ts` — `type`-filtered CRUD for annonces
- `supabase/migrations/20260405142105_add_type_to_ads.sql` — Adds `type` column

## Replit Migration Notes
- Migrated from Lovable to Replit April 2026
- Removed `lovable-tagger` Vite plugin (Lovable-only)
- Changed Vite server port from 8080 to 5000 (Replit webview requirement)
- Set `allowedHosts: true` for Replit proxy compatibility
