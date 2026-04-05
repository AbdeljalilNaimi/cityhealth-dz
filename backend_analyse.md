# CityHealth — Backend & Database Architecture Analysis

> **Project:** CityHealth — Health Platform for Sidi Bel Abbès, Algeria  
> **Stack:** React 18 + TypeScript + Vite / Firebase + Supabase  
> **Date:** April 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Backend Architecture](#2-backend-architecture)
3. [Firebase — Detailed Breakdown](#3-firebase--detailed-breakdown)
4. [Supabase — Detailed Breakdown](#4-supabase--detailed-breakdown)
5. [Database Structure](#5-database-structure)
6. [Authentication System](#6-authentication-system)
7. [Services Layer (Controllers)](#7-services-layer-controllers)
8. [Serverless Functions](#8-serverless-functions)
9. [Data Flow Diagram](#9-data-flow-diagram)
10. [Separation of Responsibilities](#10-separation-of-responsibilities)
11. [Cross-Platform Interactions](#11-cross-platform-interactions)
12. [Overlaps, Inconsistencies & Redundancies](#12-overlaps-inconsistencies--redundancies)

---

## 1. System Overview

CityHealth is a hybrid BaaS (Backend-as-a-Service) application that uses **two separate backend platforms in parallel**:

| Platform | Role in System | Users Served |
|---|---|---|
| **Firebase** | Professional/Admin platform | Providers (doctors, hospitals, pharmacies…) & Admins |
| **Supabase** | Consumer/Citizen platform | Citizens (patients) & Developers |

Neither platform is a "primary" backend — both are essential, each owning a distinct user domain. The frontend (`src/`) communicates with both simultaneously, with `AuthContext.tsx` acting as the central broker.

---

## 2. Backend Architecture

The backend is structured into four layers:

```
┌──────────────────────────────────────────────┐
│              React Frontend (Vite)           │
│  src/pages / src/components / src/hooks      │
└──────────┬──────────────────┬───────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │  src/services│    │src/contexts │
    │  (Business   │    │(AuthContext)│
    │   Logic)     │    └──────┬──────┘
    └──────┬───────┘           │
           │         ┌─────────┴──────────┐
           │         │                    │
    ┌──────▼──────┐  │  ┌─────────────────▼──┐
    │  Firebase   │◄─┘  │      Supabase       │
    │  Firestore  │     │  PostgreSQL + Auth  │
    │  Auth       │     │  Edge Functions     │
    │  Storage    │     │  Storage            │
    │  Functions  │     │  Realtime           │
    └─────────────┘     └─────────────────────┘
```

**Key source files:**
- `src/lib/firebase.ts` — Firebase client initialisation (Auth, Firestore, Storage, Functions)
- `src/integrations/supabase/client.ts` — Supabase client initialisation (env-var driven)
- `src/integrations/supabase/types.ts` — Full auto-generated TypeScript types for all Supabase tables
- `src/contexts/AuthContext.tsx` — Unified auth context managing both Firebase and Supabase sessions
- `src/services/` — All business logic services (25+ files)

---

## 3. Firebase — Detailed Breakdown

### 3.1 Firebase Configuration
**File:** `src/lib/firebase.ts`  
**Project ID:** `cityhealth-ec7e7`  
**Storage Bucket:** `cityhealth-ec7e7.firebasestorage.app`

Exported services:
- `auth` — Firebase Authentication
- `db` — Firestore database
- `storage` — Firebase Storage
- `functions` — Cloud Functions client
- `googleProvider` — Google OAuth provider

### 3.2 Firebase Authentication
**Target users:** Providers and Admins  
**Methods:** Email/Password, Google OAuth  
**Operations:** `signInWithEmailAndPassword`, `onAuthStateChanged`, `signOut`, `updateProfile`

### 3.3 Firestore Collections

| Collection | Purpose | Key Operations |
|---|---|---|
| `users` | Base user documents keyed by UID | Read/Write via AuthContext |
| `profiles` | Provider/Admin profile data (name, avatar, roles) | Update on profile edit |
| `user_roles` | RBAC role assignment (`{uid}_admin`, `{uid}_provider`) | Read in AuthContext & security rules |
| `providers` | Full provider records (9 types: hospitals, pharmacies, labs, clinics, etc.) | Full CRUD via `firestoreProviderService.ts` |
| `providerDrafts` | Temporary data during multi-step registration wizard | Create/Read/Delete in `providerRegistrationService.ts` |
| `appointments` | Booking records (citizen ↔ provider) | CRUD + availability queries via `appointmentService.ts` |
| `appointments/{id}/notes` | Sub-collection: shared consultation notes | Create/Read via `appointmentNotesService.ts` |
| `ads` | Medical advertisements pending moderation | CRUD via `medicalAdsService.ts` |
| `verification_requests` | Queue for admin to verify providers | Create by providers, Approve/Reject by admins via `verificationService.ts` |
| `settings` | Global platform configuration | Admin read/write via `platformSettingsService.ts` |
| `audit_log` | Immutable log of all admin actions | Append-only via `auditLogService.ts` |
| `admin_notifications` | Real-time alerts shown to admins | Realtime listener in `useAdminRealtimeNotifications.ts` |
| `provider_analytics` | Provider performance events | Write-only tracking via `providerAnalyticsService.ts` |
| `favorites` | Citizen-saved provider bookmarks | CRUD for authenticated users via `favoritesService.ts` |
| `provide_offers` | Community mutual aid / donation offers | CRUD via `src/services/provide/provideService.ts` |
| `reviews` | Patient reviews of providers | CRUD via `reviewService.ts` |
| `analytics_events` | Cross-platform analytics event queue | Append-only via `analyticsService.ts` |
| `admin_profiles` | Admin-specific profile data and preferences | CRUD via `adminProfileService.ts` |
| `user_quotas` | Per-user AI chat rate limiting (100 req/hour) | Transaction-safe via Cloud Function |

### 3.4 Firebase Storage

| Folder | Content | Size Limit |
|---|---|---|
| `provider-documents/{providerId}/` | Legal documents, verification PDFs/images | 10 MB |
| `avatars/{userId}/` | User profile pictures | 5 MB |
| `public/` | General assets, provider gallery images | — |

**Managed by:** `adminProfileService.ts`, `providerImageService.ts`

### 3.5 Security Rules
- `firestore.rules` — Role-based access using `user_roles` collection
- `storage.rules` — Restricts uploads to authenticated, authorized users

---

## 4. Supabase — Detailed Breakdown

### 4.1 Supabase Configuration
**File:** `src/integrations/supabase/client.ts`  
**URL source:** `VITE_SUPABASE_URL` (environment variable)  
**Key source:** `VITE_SUPABASE_PUBLISHABLE_KEY` (environment variable)  
**Session:** `localStorage`-persisted, with auto token refresh  
**PostgreSQL version:** 14.1

### 4.2 Supabase Authentication
**Target users:** Citizens (patients) and Developers  
**Methods:** Email/Password, Magic Link (passwordless), Google OAuth  
**Sessions:** Tracked independently from Firebase; both are checked in `AuthContext.tsx`

### 4.3 Key Supabase Features Used
- **Database (PostgreSQL):** Primary datastore for citizen/community/developer data
- **Realtime:** Postgres Changes subscriptions for live blood emergency broadcasts
- **Edge Functions (Deno):** Serverless AI and utility APIs
- **Storage:** Public buckets for PDFs and provider images

---

## 5. Database Structure

### 5.1 Supabase Tables (PostgreSQL Public Schema)

#### User & Profile
| Table | Key Columns | Purpose |
|---|---|---|
| `citizen_profiles` | `id`, `user_id`, `blood_group`, `emergency_opt_in`, `weight`, `height`, `last_donation_date` | Extended patient profile data |
| `emergency_health_cards` | `id`, `user_id`, `card_data` | Digital emergency health identity cards |
| `card_consultation_logs` | `card_id`, `card_user_id`, `provider_uid`, `scanned_at` | Log of providers scanning patient cards |

#### Community & Social
| Table | Key Columns | Purpose |
|---|---|---|
| `community_posts` | `id`, `user_id`, `content`, `upvotes_count`, `comments_count` | Community forum posts |
| `community_comments` | `id`, `post_id`, `user_id`, `content`, `parent_comment_id` | Threaded comments on posts |
| `community_upvotes` | `id`, `post_id`, `comment_id`, `user_id` | Post and comment upvotes (unique per user) |
| `community_reports` | `id`, `post_id`, `reporter_id`, `reason` | Reported content |

#### Reviews & Ratings (Supabase)
| Table | Key Columns | Purpose |
|---|---|---|
| `provider_reviews` | `id`, `provider_id`, `citizen_id`, `rating`, `comment`, `status` | Patient reviews of providers |
| `review_reports` | `id`, `review_id`, `reporter_id`, `reason` | Flagged reviews |
| `admin_provider_notes` | `id`, `admin_id`, `provider_id`, `title`, `message`, `severity` | Admin internal notes on providers |
| `provider_reports` | `id`, `provider_id`, `reporter_id`, `reason` | Citizen reports against providers |

#### Advertisements & Media
| Table | Key Columns | Purpose |
|---|---|---|
| `ads` | `id`, `provider_id`, `title`, `status`, `is_featured`, `likes_count`, `views_count`, `expires_at` | Moderated provider ads (consumer-facing) |
| `ad_likes` | `id`, `ad_id`, `user_id` | Ad like records |
| `ad_saves` | `id`, `ad_id`, `user_id` | Saved ads per user |
| `ad_reports` | `id`, `ad_id`, `reporter_id`, `reason`, `status` | Reported ads |

#### Research & Knowledge
| Table | Key Columns | Purpose |
|---|---|---|
| `research_articles` | `id`, `title`, `content`, `author`, `tags`, `status` | Health research publications |
| `article_reactions` | `id`, `article_id`, `user_id`, `reaction_type` | Emoji reactions to articles |
| `article_saves` | `id`, `article_id`, `user_id` | Bookmarked articles |
| `article_views` | `id`, `article_id`, `viewer_id` | Article view tracking |

#### Emergency & Blood Donation
| Table | Key Columns | Purpose |
|---|---|---|
| `blood_emergencies` | `id`, `provider_id`, `blood_type_needed`, `urgency_level`, `status`, `responders_count`, `provider_lat`, `provider_lng` | Active blood donation requests |
| `blood_emergency_responses` | `id`, `emergency_id`, `citizen_id`, `citizen_phone`, `status` | Citizen responses to blood requests |
| `donation_history` | `id`, `citizen_id`, `provider_id`, `provider_name`, `blood_type`, `donated_at`, `emergency_id`, `notes` | Permanent record of confirmed donations; triggers Firestore profile sync |

#### Developer API Ecosystem
| Table | Key Columns | Purpose |
|---|---|---|
| `api_keys` | `id`, `developer_id`, `key_hash`, `key_suffix`, `plan`, `rate_limit_per_day`, `is_active` | Hashed API keys per developer |
| `api_usage` | `id`, `api_key_id`, `date`, `endpoint`, `request_count` | Daily usage per endpoint |
| `api_logs` | `id`, `api_key_id`, `endpoint`, `method`, `status_code`, `response_time_ms` | Request-level access logs |

#### Configuration
| Table | Key Columns | Purpose |
|---|---|---|
| `contact_settings` | `id`, `email`, `phone`, `address` | Platform contact information |

### 5.2 Supabase Storage Buckets

| Bucket | Contents |
|---|---|
| `pdfs` | Research papers and medical documents |
| `provider-images` | Ad images, provider photos |

### 5.3 Firestore Data Structure (Firebase)
Firestore is schema-less (NoSQL). Key document shapes:

**`providers/{id}`**
```
{
  name, type, city, address, lat, lng,
  phone, email, website,
  verificationStatus: 'pending' | 'approved' | 'rejected',
  isActive, score, createdAt,
  gallery: string[],
  specialties: string[],
  workingHours: { [day]: { open, close } }
}
```

**`appointments/{id}`**
```
{
  citizenId, providerId,
  date, time, status,
  notes: string,
  createdAt, updatedAt
}
```

**`user_roles/{uid}_{role}`**
```
{
  userId, role: 'admin' | 'provider',
  assignedAt, assignedBy
}
```

---

## 6. Authentication System

The authentication system is unified in `src/contexts/AuthContext.tsx` and runs **two parallel auth listeners**.

```
User visits app
      │
      ├─ Firebase onAuthStateChanged listener ──► Provider/Admin detected
      │         │                                  Profile fetched from Firestore
      │         │                                  Roles loaded from user_roles
      │
      └─ Supabase onAuthStateChange listener ──► Citizen/Developer detected
                │                                  Profile fetched from citizen_profiles
                │                                  Extended data merged into UserProfile
```

### Auth Method Matrix

| Action | Method | Platform |
|---|---|---|
| `loginAsCitizen()` | Email/Password | Supabase |
| `signupAsCitizen()` | Email/Password | Supabase |
| `loginAsCitizenWithMagicLink()` | Magic Link (OTP email) | Supabase |
| `loginWithGoogle()` for citizen | OAuth | Supabase |
| `loginAsProvider()` | Email/Password | Firebase |
| `loginAsAdmin()` | Email/Password | Firebase |
| `loginWithGoogle()` for provider | OAuth | Firebase |
| `logout()` | Signs out both sessions | Both |

### UserType Resolution
```
AuthContext resolves UserType by:
1. If Firebase user exists AND has a provider/admin role in Firestore → 'provider' or 'admin'
2. If Supabase session exists AND no Firebase provider role → 'citizen'
3. Unified UserProfile object is constructed from whichever platform matches
```

---

## 7. Services Layer (Controllers)

All business logic is encapsulated in `src/services/`. These act as the controller layer.

### Firebase-Connected Services

| Service File | Platform | Responsibility |
|---|---|---|
| `firestoreProviderService.ts` | Firebase | CRUD for all 9 provider types |
| `providerRegistrationService.ts` | Firebase | Multi-step wizard, role assignment, profile scoring |
| `appointmentService.ts` | Firebase | Bookings, availability, status updates |
| `appointmentNotesService.ts` | Firebase | Shared notes sub-collection |
| `verificationService.ts` | Firebase | Admin verification workflow |
| `auditLogService.ts` | Firebase | Immutable admin audit trail |
| `notificationService.ts` | Firebase (stub) | Booking email notifications (localStorage mock in dev) |
| `adminNotificationService.ts` | Firebase | Admin-specific real-time alerts |
| `adminProfileService.ts` | Firebase + Storage | Admin profile & document management |
| `providerImageService.ts` | Firebase Storage | Provider gallery image management |
| `medicalAdsService.ts` | Firebase | Ad moderation queue (provider-side) |
| `userManagementService.ts` | Firebase | Admin-level user/role management |
| `favoritesService.ts` | Firebase | Citizen bookmark management |
| `provide/provideService.ts` | Firebase | Community aid offers |
| `platformSettingsService.ts` | Firebase | Global platform config |
| `platformAnalyticsService.ts` | Firebase | Admin analytics aggregation |
| `providerAnalyticsService.ts` | Firebase | Provider performance tracking |
| `reviewService.ts` | Firebase | Patient reviews and ratings (Firestore `reviews` collection) |
| `analyticsService.ts` | Firebase | Cross-platform event queue (batched writes to Firestore) |

### Supabase-Connected Services

| Service File | Platform | Responsibility |
|---|---|---|
| `communityService.ts` | Supabase | Posts, comments, upvotes, reports |
| `bloodEmergencyService.ts` | Supabase + Realtime | Live blood donation broadcasting |
| `emergencyCardService.ts` | Supabase | Emergency health card management |
| `researchService.ts` | Supabase | Research article queries with pagination |
| `adsService.ts` | Supabase | Ad browsing, likes, saves (citizen-facing) |
| `apiKeyService.ts` | Supabase | Developer API key lifecycle |

### AI & Utility Services

| Service File | Platform | Responsibility |
|---|---|---|
| `aiChatService.ts` | Firebase Functions (SSE) | Streaming AI medical assistant via `VITE_AI_CHAT_FUNCTION_URL` |
| `n8nChatService.ts` | External (n8n webhook) | Workflow automation chat via `VITE_N8N_WEBHOOK_URL` |
| `ocrVerificationService.ts` | Client-side (Tesseract.js) | Document OCR for verification — runs entirely in the browser |

---

## 8. Serverless Functions

### Firebase Cloud Functions (`firebase-functions/`)

| Function | Trigger | Purpose |
|---|---|---|
| `ai-chat` (exports.aiChat) | HTTPS | Streams AI chat responses via Server-Sent Events (SSE) using OpenAI/Claude; includes Firestore-backed rate limiting (100 req/user/hour) |

### Supabase Edge Functions (`supabase/functions/`)

| Function | Purpose | Supabase Features Used |
|---|---|---|
| `public-api` | External developer REST API gateway — validates `api_keys`, enforces `api_usage` rate limits, proxies provider data | DB queries, Auth |
| `chat-with-pdf` | AI-powered medical document Q&A | Storage (pdfs bucket), LLM integration |
| `map-bot` | AI assistant for the interactive map | LLM integration |
| `symptom-triage` | AI-driven symptom checker | LLM integration |
| `contact-form` | Processes support/contact requests | DB insert, Email |
| `sync-provider` | Bridge: syncs provider data from Firebase into Supabase public tables | Cross-platform |

---

## 9. Data Flow Diagram

### Citizen (Patient) Flow
```
Citizen → Supabase Auth login
        → citizen_profiles (Supabase) ← profile data
        → community_posts / blood_emergencies (Supabase) ← community actions
        → appointments (Firestore) ← books a provider
        → reviews (Firestore) ← leaves a review
```

### Provider Flow
```
Provider → Firebase Auth login
         → Firestore: user_roles (role check)
         → Firestore: providerDrafts (registration wizard)
         → Firestore: verification_requests (submitted for admin review)
         → Firestore: providers (approved profile published)
         → Firestore: appointments (manages bookings)
         → Supabase: ads (posts advertisements visible to citizens)
         → Supabase: blood_emergencies (broadcasts donation requests)
```

### Admin Flow
```
Admin → Firebase Auth login
      → Firestore: user_roles (role = 'admin')
      → Firestore: verification_requests (approves/rejects providers)
      → Firestore: audit_log (all actions logged)
      → Supabase: admin_provider_notes, provider_reports (moderation)
```

### Developer Flow
```
Developer → Supabase Auth login
          → Supabase: api_keys (creates hashed API key)
          → Supabase Edge Function: public-api
            → validates key_hash against api_keys table
            → checks daily quota in api_usage
            → writes to api_logs
            → returns provider data from Firestore (via sync-provider bridge)
```

---

## 10. Separation of Responsibilities

### Firebase owns:
- ✅ Provider authentication & session management
- ✅ Admin authentication & role management
- ✅ All provider profile data and the 9 provider type records
- ✅ Appointment booking system (provider ↔ citizen)
- ✅ Provider onboarding and verification workflow
- ✅ Platform settings and global configuration
- ✅ Audit logging and admin notifications
- ✅ File storage for provider documents and avatars
- ✅ AI chat streaming (Cloud Functions + SSE)
- ✅ Provider reviews and ratings (Firestore `reviews` collection)
- ✅ Cross-platform analytics event queue (Firestore `analytics_events`)

### Supabase owns:
- ✅ Citizen authentication & session management
- ✅ Developer authentication & API key management
- ✅ Citizen extended profiles (health data, blood group, emergency opt-in)
- ✅ Community forum (posts, comments, upvotes, reports)
- ✅ Blood emergency broadcasting (with Realtime subscriptions)
- ✅ Emergency health cards
- ✅ Advertisement display (consumer side — `adsService.ts`)
- ✅ Research article publishing and engagement
- ✅ Public developer API gateway (Edge Function)
- ✅ AI health assistant edge functions (PDF chat, symptom triage)

---

## 11. Cross-Platform Interactions

These are the key points where Firebase and Supabase data or sessions interact:

| Interaction | How It Works |
|---|---|
| **Unified Logout** | `AuthContext.logout()` calls both `firebaseSignOut()` and `supabase.auth.signOut()` in sequence |
| **Blood Emergency ↔ Donor Profile** | When a citizen confirms a donation, `bloodEmergencyService.ts::addDonation()` inserts a record into the Supabase `donation_history` table, then immediately syncs `last_donation_date` back to the Firestore `profiles/{citizen_id}` document via `updateDoc`. The initial response (`respondToEmergency`) only writes to `blood_emergency_responses`; the Firestore sync is triggered later by the explicit donation confirmation step. |
| **Provider data in Supabase ads** | Providers authenticated via Firebase create ad records in the Supabase `ads` table using the Firebase UID as `provider_id` |
| **sync-provider Edge Function** | A dedicated Supabase Edge Function (`sync-provider`) reads provider data from Firestore and writes it into a Supabase `providers_public` table; the `public-api` Edge Function then serves this mirrored data to external developers. Provider data is not fetched directly from Firestore at request time — it is bridged through this sync layer. |
| **Reviews referencing Firestore providers** | The Firestore `reviews` collection uses `provider_id` values that are Firestore document IDs |
| **Citizen booking providers** | A citizen (Supabase session) creates an `appointments` document in Firestore using their Supabase UID as `patientId` |
| **AuthContext dual listener** | Both `onAuthStateChanged` (Firebase) and `supabase.auth.onAuthStateChange` run simultaneously; live refs (`liveUserRef`, `liveSupabaseUserRef`) prevent stale closure race conditions |

---

## 12. Overlaps, Inconsistencies & Redundancies

### Overlaps

| Issue | Description |
|---|---|
| **`ads` collection/table exists in both** | Firestore has an `ads` collection (`medicalAdsService.ts` — provider-managed, moderation queue); Supabase has an `ads` table (`adsService.ts` — citizen-facing display). These represent different lifecycle stages of the same entity but are not automatically synced. |
| **`provide_offers` in Firestore vs community in Supabase** | Community aid offers are in Firestore while community posts are in Supabase — two separate community systems that could confuse users. |
| **Firebase UID used as foreign key in Supabase** | `blood_emergencies.provider_id` and `ads.provider_id` in Supabase all store Firebase UIDs. This creates a tight implicit coupling with no enforced referential integrity. |
| **Citizen UID used in Firestore** | `appointments.patientId` in Firestore stores the Supabase UID of a citizen. Cross-database foreign key with no enforcement. |
| **Dual review systems** | `reviewService.ts` (Firebase) writes patient reviews to the Firestore `reviews` collection. Supabase also contains a `provider_reviews` table with a corresponding `review_reports` table. These two review stores are independent and not synced — active in-app writes currently target Firestore, while the Supabase tables appear to be unused or intended for future migration. |

### Inconsistencies

| Issue | Description |
|---|---|
| **Dual auth listeners with race condition risk** | Both Firebase and Supabase auth listeners run independently. The codebase mitigates this using live refs (`liveUserRef`, `liveSupabaseUserRef`, `liveProfileRef`) and deferred profile fetches via `setTimeout`, but a brief out-of-sync window remains possible. |
| **No single source of truth for user identity** | A "user" is either a Firebase User or a Supabase User — there is no unified user record that links the two. |
| **`UserProfile.verification_status` duplicated** | Both `verification_status` and `verificationStatus` exist on the `UserProfile` interface (snake_case vs camelCase), suggesting inconsistent refactoring. |
| **`notificationService.ts` is a stub** | The notification service stores notifications in `localStorage` instead of actually sending emails, with production code commented out. |
| **OCR runs client-side** | `ocrVerificationService.ts` uses Tesseract.js in the browser rather than a secure serverless function, exposing document processing to the client. |

### Redundancies

| Issue | Description |
|---|---|
| **Two separate notification systems** | Firestore `admin_notifications` for admins and Supabase `admin_provider_notes` for cross-platform notes serve overlapping moderation communication needs. |
| **`sync-provider` Edge Function** | The need for a dedicated sync function highlights that provider data is duplicated/bridged between systems rather than stored in one canonical location. |
| **Dual analytics** | `analyticsService.ts` (Firestore `analytics_events`) and `providerAnalyticsService.ts` (Firestore `provider_analytics`) both exist alongside Supabase's `api_usage` and `api_logs`, resulting in three separate analytics stores. |
