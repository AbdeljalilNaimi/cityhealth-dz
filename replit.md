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
The app uses these env vars (set as Replit env vars/secrets):
- `VITE_SUPABASE_URL` — Supabase project URL (`https://dhbegdhoyhnrwmoktomi.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (used by edge functions)
- Firebase config is hardcoded in `src/lib/firebase.ts` (Firebase keys are safe for client-side use per Firebase docs)

### Active Supabase Project
- **Project ref**: `dhbegdhoyhnrwmoktomi` (migrated April 2026 from `qedotqjxndtmskcgrajt`)
- **Region**: eu-west-1
- All 25 migrations applied to this project, including `type`, `category`, `doi`, `pdf_url` columns on `ads` table

## Content System Architecture (April 2026)

### Annonces vs Publications
The `ads` table uses a `type` column to distinguish two separate content systems:

- **Annonces** (`type = 'annonce'`): Provider-created posts (Titre, Description courte ≤200, Description complète, Date d'expiration). Direct publish — no admin approval. Appear only on the provider's public profile under the `Annonces` section. Managed via `ProviderAdsManager` in the dashboard `Annonces` tab.
- **Publications** (`type = 'publication'`): Rich content (Titre, Catégorie, Résumé, Contenu, Mots-clés, DOI, PDF, Image). Require admin approval. Appear in `/annonces` public page after approval. Managed in the dashboard `Mes Publications` tab.

### Key files
- `src/components/ads/ProviderAdsManager.tsx` — Annonces dashboard form & list
- `src/components/ads/ProviderPublicationsManager.tsx` — Publications dashboard form & list
- `src/components/ads/ProviderAnnoncesPublic.tsx` — Public view on provider profile
- `src/components/ads/AdDetailDialog.tsx` — Ad detail modal (handles both types)
- `src/components/admin/AdsModeration.tsx` — Admin moderation (publications only)
- `src/services/adsService.ts` — `type`-filtered CRUD for both annonces and publications
- `supabase/migrations/20260405142105_add_type_to_ads.sql` — Adds `type` column
- `supabase/migrations/20260405200000_add_publication_fields_to_ads.sql` — Adds category/doi/pdf_url

## Context-Based Rating System (April 2026)

A non-intrusive, context-triggered rating system has been implemented.

### How it works
- **Triggers**: After a user books an appointment (BookingModal success), clicks "Itinéraire" (route) or "Appeler" (call) on the map sidebar
- **Delay**: Appears 1–2 seconds after the triggering action
- **Deduplication**: Uses `sessionStorage` to ensure each action type × provider shows the rating sheet at most once per browser session
- **UI**: Animated bottom sheet with 5 stars; one-click = instant save. Optional feedback text field appears only for ratings ≤ 3 stars. Auto-dismisses after 9 seconds if ignored.

### Database
- **Table**: `platform_ratings` in Supabase — stores rating (1–5), feedback, action_type, provider_id, session_id
- **Migration**: `supabase/migrations/20260405500000_add_platform_ratings.sql`
- ⚠️ **Manual step required**: Apply the migration via the Supabase dashboard SQL editor if `supabase db push` fails

### Homepage integration
- `StatsSection.tsx` now fetches live average from `platform_ratings` via `usePlatformRatingStats` hook
- Falls back to 4.7 if the table is empty or unavailable
- Displays real total rating count alongside the average

### Key files
- `src/contexts/RatingContext.tsx` — global trigger/dismiss state
- `src/components/ContextRatingSheet.tsx` — bottom sheet UI
- `src/hooks/usePlatformRatings.ts` — fetch stats + submit mutation
- Triggers wired in: `src/components/BookingModal.tsx`, `src/components/map/MapSidebar.tsx`

## Replit Migration Notes
- Migrated from Lovable to Replit April 2026
- Removed `lovable-tagger` Vite plugin (Lovable-only)
- Changed Vite server port from 8080 to 5000 (Replit webview requirement)
- Set `allowedHosts: true` for Replit proxy compatibility
