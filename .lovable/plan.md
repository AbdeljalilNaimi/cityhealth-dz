

## Review Management Enhancements

### Current State
- **Table**: `provider_reviews` in Supabase with columns: `id`, `provider_id`, `patient_id`, `patient_name`, `rating`, `comment`, `created_at`
- **Hooks**: `useSupabaseReviews` (fetch by provider + submit), `usePatientSupabaseReviews` (fetch by patient)
- **UI**: `ReviewSystem.tsx` component for displaying/submitting reviews, used on provider profiles
- **Patient Dashboard**: Shows patient's own reviews (read-only)
- **Admin Dashboard**: No review management tab exists
- **Auth**: Firebase Auth with roles (`patient`, `provider`, `admin`) stored in Firestore

### Database Changes

**1. Add `review_reports` table** (new migration):
```sql
CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.provider_reviews(id) ON DELETE CASCADE,
  reporter_id text NOT NULL,
  reporter_type text NOT NULL DEFAULT 'provider',
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
-- Public RLS (same pattern as other tables - Firebase auth, not Supabase auth)
CREATE POLICY "Public read review reports" ON public.review_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert review reports" ON public.review_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update review reports" ON public.review_reports FOR UPDATE USING (true);
```

**2. Enable DELETE and UPDATE on `provider_reviews`** (currently blocked):
```sql
CREATE POLICY "Anyone can delete provider reviews" ON public.provider_reviews FOR DELETE USING (true);
CREATE POLICY "Anyone can update provider reviews" ON public.provider_reviews FOR UPDATE USING (true);
```

Note: Role-based access control is enforced at the application level (Firebase Auth roles), matching the existing pattern used across all other tables.

### Code Changes

**1. `src/hooks/useSupabaseReviews.ts`** — Add mutations:
- `useDeleteReview(queryKeyProviderId?)` — delete a review by ID, invalidate queries
- `useUpdateReview()` — update rating/comment by review ID
- `useAllReviews(filters)` — admin hook to fetch all reviews with filters (provider category, provider_id, rating, date range), joins `providers_public` for category info
- `useReportReview()` — insert into `review_reports`
- `useReviewReports()` — admin hook to fetch pending review reports

**2. `src/components/patient/PatientReviewsManager.tsx`** (new) — Citizen's review management:
- List user's reviews with edit/delete buttons
- Edit dialog: modify rating + comment
- Delete confirmation dialog
- Role check: only allows actions on reviews where `patient_id === user.uid`

**3. `src/pages/PatientDashboard.tsx`** — Replace read-only reviews section with `PatientReviewsManager`

**4. `src/components/provider/ProviderReviewsPanel.tsx`** (new) — Provider's review view:
- List all reviews on their profile (already fetched via `useSupabaseReviews`)
- "Report" button on each review → opens report dialog (reason + details)
- Calls `useReportReview` mutation

**5. `src/pages/ProviderDashboard.tsx`** — Add "Avis" tab using `ProviderReviewsPanel`

**6. `src/components/admin/AdminReviewsPanel.tsx`** (new) — Full admin review management:
- Fetch all reviews via `useAllReviews` with filters
- **Filters**: provider category dropdown (from provider types), specific provider search, rating (1-5), date range
- Table view: patient name, provider name, rating, comment, date, actions
- Delete any review button with confirmation
- View/manage reported reviews section (from `review_reports`)
- Mark reports as resolved/dismissed

**7. `src/pages/AdminDashboard.tsx`** — Add `reviews` tab case rendering `AdminReviewsPanel`

**8. `src/components/admin/AdminSidebar.tsx`** — Add "Avis" nav item with `Star` icon in the "main" section

### Role Permission Summary

| Action | Patient | Provider | Admin |
|--------|---------|----------|-------|
| View own reviews | Yes | — | — |
| Edit own review | Yes | — | — |
| Delete own review | Yes | — | Yes (any) |
| View reviews on profile | — | Yes | Yes (all) |
| Report a review | — | Yes | — |
| Filter/search reviews | — | — | Yes |
| Manage review reports | — | — | Yes |

