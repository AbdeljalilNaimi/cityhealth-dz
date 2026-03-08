

## Analysis

After reviewing the codebase, here's the current state:

### 1. Developer Email Verification (Already Supabase-based)
The developer portal uses **Supabase Auth** (not Firebase), as established in a previous migration. The current flow:
- `DeveloperRegisterPage.tsx` calls `supabase.auth.signUp()` with `emailRedirectTo: /developers/login`
- `DeveloperLoginPage.tsx` already handles the email confirmation callback (lines 20-41), detects `access_token` in the URL hash, and redirects to `/developers/dashboard`
- `DeveloperDashboardPage.tsx` uses `supabase.auth.getSession()` to gate access

**Issue**: The user mentions Firebase's `createUserWithEmailAndPassword` and Firestore `developers` collection, but the developer portal was intentionally migrated to Supabase to avoid Firebase domain authorization errors on preview environments. The current Supabase flow is correct and functional.

**What actually needs fixing**: The redirect URL should point to `/developers/dashboard` directly (not `/developers/login`) so that after email confirmation, the user lands on the dashboard automatically. The login page callback handler works but adds an unnecessary intermediary step.

### 2. Firebase Cron Sync Script
Create `scripts/firebase-cron-sync.js` containing a Firebase Scheduled Cloud Function using `functions.pubsub.schedule('every 24 hours')` that:
- Queries Firestore for verified providers
- Maps to public fields
- POSTs to the `sync-provider` edge function

### 3. Dev-Tools "Force Sync" Label
Update the sync card in `DevToolsPage.tsx` to clearly indicate it's a manual "Force Sync" distinct from the automated 24h cycle.

## Plan

### Task 1: Fix Developer Email Redirect
**File**: `src/pages/developers/DeveloperRegisterPage.tsx`
- Change `emailRedirectTo` from `/developers/login` to `/developers/dashboard`
- Same change in the resend handler
- This way, after clicking the confirmation link, the user lands directly on their dashboard

**File**: `src/pages/developers/DeveloperDashboardPage.tsx`
- Add URL hash detection (same pattern as login page) to handle the email confirmation token exchange when users land directly on the dashboard from the email link

### Task 2: Create Firebase Cron Sync Script
**New file**: `scripts/firebase-cron-sync.js`
- Complete Node.js Firebase Cloud Function using `functions.pubsub.schedule('every 24 hours')`
- Fetches verified providers from Firestore
- Maps to safe public fields matching the `providers_public` schema
- POSTs batch to `/functions/v1/sync-provider` with `x-sync-secret`
- Includes deployment instructions as comments

### Task 3: Update Dev-Tools Sync Button
**File**: `src/pages/DevToolsPage.tsx`
- Rename the card title to "Force Sync — API Publique"
- Update description to explain this is for immediate updates outside the 24h automated cycle
- Add a small info note about the automated cron schedule

