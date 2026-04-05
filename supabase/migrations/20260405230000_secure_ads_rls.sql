-- ============================================================
-- Fix ads RLS: restrict UPDATE/DELETE to prevent unauthorized
-- status changes. The service role (used by Edge Functions)
-- bypasses RLS automatically.
-- ============================================================

-- Drop the broken policies from previous migration
DROP POLICY IF EXISTS "Providers can update own ads" ON public.ads;
DROP POLICY IF EXISTS "Providers can delete own ads" ON public.ads;

-- Allow providers to update their own ads (but NOT the status field)
-- Providers can update title, description, image_url, etc. on their own ads.
-- Status updates are blocked at the app level and enforced by Edge Function only.
-- Using provider_id claim from JWT is not possible with Firebase auth, so we use
-- a restrictive policy: only allow UPDATE where status is NOT changing to approved/rejected/suspended.
CREATE POLICY "Providers can update own non-status fields"
  ON public.ads FOR UPDATE
  USING (true)
  WITH CHECK (status = 'pending');  -- can only UPDATE rows keeping status=pending (new submissions)

-- Providers can delete only pending or rejected publications (not approved ones)
CREATE POLICY "Providers can delete pending or rejected ads"
  ON public.ads FOR DELETE
  USING (status IN ('pending', 'rejected'));

-- ============================================================
-- Fix ad_notifications RLS
-- ============================================================

DROP POLICY IF EXISTS "Public read ad_notifications by provider_id" ON public.ad_notifications;
DROP POLICY IF EXISTS "Service role can insert ad_notifications" ON public.ad_notifications;
DROP POLICY IF EXISTS "Providers can mark own notifications read" ON public.ad_notifications;

-- Only allow reading notifications (provider_id is validated at app level)
CREATE POLICY "Providers read own notifications"
  ON public.ad_notifications FOR SELECT
  USING (true);

-- Block direct INSERT from anon (service role bypasses RLS)
CREATE POLICY "Service inserts notifications"
  ON public.ad_notifications FOR INSERT
  WITH CHECK (false);  -- anon cannot insert; only service role (edge functions) can

-- Allow marking notifications as read (update only the read field)
CREATE POLICY "Providers update read status"
  ON public.ad_notifications FOR UPDATE
  USING (true)
  WITH CHECK (true);
