

# New "Inscription Professionnel" Section on Homepage

## Overview
Create a new `ProviderRegistrationSection` component that visually presents the provider registration process with a step-by-step preview, placed just before the footer on the main page. This is distinct from the existing `ProviderCTA` (which is a general call-to-action).

## What will be built

A visually appealing section showing:
- A headline inviting providers to register
- A visual 3-step process: (1) Choose your type, (2) Fill your profile, (3) Get verified
- Icons for each supported provider type (Hospital, Clinic, Doctor, Pharmacy, Lab, Radiology, Dentist, Blood Cabin)
- A prominent "Start Registration" button linking to `/provider/register`
- Trilingual support (FR/AR/EN) following existing patterns
- RTL support for Arabic

## Technical Details

### 1. Create `src/components/homepage/ProviderRegistrationSection.tsx`
- New component with 3 animated step cards showing the registration flow
- Provider type icons grid (all 8 types from `PROVIDER_TYPES`)
- Gradient background matching the site's design language
- Uses existing UI components (Card, Button, Badge)
- Trilingual content object (fr/ar/en) like `ProviderCTA`
- Framer Motion entrance animations

### 2. Update `src/pages/AntigravityIndex.tsx`
- Import and add `ProviderRegistrationSection` between the last section (`ProviderCTA`) and `Footer`
- Wrap in a div with `id="inscription-provider"` for anchor linking

### 3. End-to-end verification
- Navigate to homepage and scroll to the new section
- Click the registration button to confirm it navigates to `/provider/register`
- Verify visual rendering and responsiveness

