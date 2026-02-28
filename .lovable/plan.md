

# Developer Portal Authentication & Fixes

## Overview
Create a dedicated developer login/register flow separate from citizen auth, add logout to the dashboard, and fix the API docs URL.

## 1. Create `src/pages/developers/DeveloperLoginPage.tsx`

Split-screen layout inspired by Stripe/Vercel:
- **Left panel**: Dark/branded sidebar with "CityHealth API" branding, tagline "Access healthcare data instantly", and feature highlights (Fast, Secure, Easy)
- **Right panel**: Clean login form with Email + Password fields
- Uses existing `loginAsCitizen` from AuthContext (developers are citizen-type users in Firebase -- no new user type needed, they just access the developer dashboard)
- On successful login, redirect to `/developers/dashboard`
- Link to `/developers/register` for new accounts
- Password visibility toggle, validation with Zod

## 2. Create `src/pages/developers/DeveloperRegisterPage.tsx`

Same split-screen layout as login:
- **Fields**: Full Name, Email, Company/App Name (stored in profile), Password
- Uses `signupAsCitizen` from AuthContext for Firebase registration
- Stores company/app name in the Firestore profile (as a custom field)
- After registration, shows email verification message
- Link to `/developers/login` for existing accounts

## 3. Update `src/App.tsx`

- Add lazy imports for `DeveloperLoginPage` and `DeveloperRegisterPage`
- Add two new routes:
  - `/developers/login` -> `DeveloperLoginPage`
  - `/developers/register` -> `DeveloperRegisterPage`
- Add these paths to `hiddenPrefixes` in `ConditionalHeader` (already covered by `/developers` prefix)

## 4. Update `src/pages/developers/DeveloperLandingPage.tsx`

- Change CTA buttons ("Obtenir une cle API", "Creer un compte developpeur") to navigate to `/developers/register` instead of `/developers/dashboard`

## 5. Update `src/pages/developers/DeveloperDashboardPage.tsx`

- Change unauthenticated redirect from `/citizen/login` to `/developers/login`
- Add a "Se deconnecter" (Logout) button in the header area next to the title, using `logout` from `useAuth()`

## 6. Fix `src/pages/developers/DeveloperDocsPage.tsx`

- Update `API_BASE` constant from the old Supabase URL (`hozjbchgaucbfqumrhhs`) to the correct project URL: `https://lerfyjdokajfkyarlhjg.supabase.co/functions/v1/public-api`

## Technical Details

- **No new user type needed**: Developers authenticate as regular Firebase users (citizen type). The developer dashboard simply checks `isAuthenticated`.
- **Auth methods used**: `signInWithEmailAndPassword` (login), `createUserWithEmailAndPassword` via `signupAsCitizen` (register) from existing AuthContext
- **Styling**: Tailwind CSS with dark/light mode support using existing design tokens (`bg-background`, `text-foreground`, `bg-primary`, etc.)
- **Files created**: 2 new pages
- **Files modified**: 4 existing files (App.tsx, DeveloperLandingPage, DeveloperDashboardPage, DeveloperDocsPage)

