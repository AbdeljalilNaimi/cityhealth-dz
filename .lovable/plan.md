

## Plan: Fix Admin Dashboard - Inscriptions, Annonces, Utilisateurs, Analytiques, Signalements

### Issues Identified

1. **Inscriptions** - Only shows `pending` providers (via `usePendingProviders`). Need to show ALL providers with status filtering.

2. **Annonces** - Already functional (reads from Supabase `ads` table). The AdsModeration component works correctly with approve/reject/suspend/featured/delete. No changes needed unless there's a specific runtime issue.

3. **Utilisateurs** - Only has "Citoyens" and "Admins" tabs. Missing a "Prestataires" (providers) tab showing all providers from Firestore.

4. **Analytiques** - `getDailyStats()` returns random mock data instead of real Firestore data. The `getPlatformStats()` reads real data but daily charts are fake. Need to generate real daily stats from Firestore timestamps.

5. **Rendez-vous** - Remove from sidebar (user said "no need").

6. **Signalements** - Only shows `provider_reports` from Supabase. Should also show `ad_reports` and `community_reports` in separate tabs for a complete moderation view.

### Changes

#### 1. Inscriptions - Show all providers with status filter
**File: `src/pages/AdminDashboard.tsx`**
- Replace `usePendingProviders` filtering with `useAllProviders` data in the inscriptions tab
- Add a status filter (All / Pending / Verified / Rejected) using Tabs
- Show all providers with their verification status badge
- Keep approve/reject actions only for pending providers

#### 2. Utilisateurs - Add providers tab
**File: `src/components/admin/UserManagement.tsx`**
- Add a third tab "Prestataires" alongside Citoyens and Admins
- Import `getAllProviders` from firestoreProviderService
- Display providers in a table with: name, type, city, phone, verification status, registration date
- Add search filtering for providers

#### 3. Analytiques - Replace mock daily stats with real data
**File: `src/services/platformAnalyticsService.ts`**
- Rewrite `getDailyStats()` to aggregate real data from Firestore `citizens`, `providers`, and `appointments` collections by `createdAt` date
- Keep the chart structure the same

#### 4. Remove Rendez-vous from sidebar
**File: `src/components/admin/AdminSidebar.tsx`**
- Remove the "Rendez-vous" nav item from `navItems` array

**File: `src/pages/AdminDashboard.tsx`**
- Remove the `appointments` case from `renderTabContent` and `TAB_TITLES`
- Remove `AdminAppointmentsOverview` import

#### 5. Signalements - Consolidate all report types
**File: `src/components/admin/ReportsModerationPanel.tsx`**
- Add tabs for 3 report sources: "Profils" (provider_reports), "Annonces" (ad_reports), "Communauté" (community_reports)
- Each sub-tab fetches from respective Supabase table
- Reuse existing status update pattern for all three

### Technical Notes
- Provider data comes from Firebase Firestore (`providers` collection)
- Report data comes from Supabase (`provider_reports`, `ad_reports`, `community_reports` tables)
- Ads data comes from Supabase (`ads` table) - already working
- No database migrations needed - all tables already exist

