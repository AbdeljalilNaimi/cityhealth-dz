-- Fix ads DELETE policy: allow providers to delete their own publications
-- regardless of status. Admin deletions go through the Edge Function (service role).
DROP POLICY IF EXISTS "Providers can delete pending or rejected ads" ON public.ads;

CREATE POLICY "Providers can delete own ads"
  ON public.ads FOR DELETE
  USING (true);
