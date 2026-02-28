

## Analysis: Image Upload Verification

### Current Architecture

Image uploads use **Supabase Storage** (`provider-images` bucket) via `src/services/providerImageService.ts`. Three upload points exist:

1. **`/provider/register` (Step 5)**: Logo + gallery uploaded during registration via `providerRegistrationService.ts`. Uses blob URLs locally, then uploads to Supabase on final submission.
2. **`/provider/dashboard`**: Logo upload via avatar hover overlay (line ~810). Gallery managed via `PhotoGalleryManager` inside `NonSensitiveFieldsEditor`.
3. **Provider profile page**: Display only (no upload on public profile).

### Issues Found

1. **RLS Policy Conflict**: The storage bucket has `auth.role() = 'authenticated'` checks, but this project uses **Firebase Auth** (not Supabase Auth). The Supabase `auth.role()` will always return `'anon'` since users authenticate through Firebase, not Supabase. This means **all uploads will fail with a 403 error** for authenticated Firebase users because Supabase doesn't recognize them as authenticated.

2. **Registration Upload Path**: In `providerRegistrationService.ts` (line 121), the provider ID is set to `provider_${userId}`, but `uploadProviderLogo` uses this as the folder path. This is fine structurally but the upload itself will fail due to RLS issue above.

3. **Dashboard Logo Upload**: Works only if Supabase auth is active (which it isn't - Firebase is the auth provider).

4. **Gallery in Registration**: During Step 5, images are stored as local blob URLs. On submission, they're uploaded to Supabase. But blob URLs saved to localStorage (draft recovery) will be invalid after page reload since `URL.createObjectURL` URLs are session-scoped.

### Proposed Fix

Since the app uses Firebase Auth (not Supabase Auth), the storage RLS policies need to allow uploads without requiring Supabase authentication. Two approaches:

**Option A (Recommended)**: Update RLS policies to allow any upload to the `provider-images` bucket (it's already public-read). Since the bucket is public and stores non-sensitive provider marketing images, this is acceptable.

**Option B**: Switch image uploads to Firebase Storage (already configured in `storage.rules`). This would require rewriting `providerImageService.ts` to use Firebase Storage SDK.

### Implementation Plan

1. **Fix storage RLS policies** - Create a new migration that drops the `auth.role() = 'authenticated'` requirement for INSERT/UPDATE/DELETE on `provider-images` bucket, replacing with `true` (since bucket is already public and content is non-sensitive marketing images).

2. **Fix blob URL persistence** - In `Step5MediaUpload`, add a warning or handle the case where blob URLs in `galleryPreviews` become invalid after page reload during draft recovery.

3. **Verify provider profile page** - The profile page only displays images, no upload issues there. Confirm `providerData.image` and `providerData.gallery` render correctly.

### Technical Details

Migration SQL:
```sql
DROP POLICY IF EXISTS "Providers can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update images" ON storage.objects;  
DROP POLICY IF EXISTS "Providers can delete images" ON storage.objects;

CREATE POLICY "Anyone can upload provider images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'provider-images');

CREATE POLICY "Anyone can update provider images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'provider-images');

CREATE POLICY "Anyone can delete provider images"
ON storage.objects FOR DELETE
USING (bucket_id = 'provider-images');
```

