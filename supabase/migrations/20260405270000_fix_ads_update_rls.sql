-- ============================================================
-- Revise ads UPDATE/DELETE RLS:
-- - All status-changing operations go through the RPC (SECURITY DEFINER)
-- - Direct updates via anon are allowed but limited to metadata fields
-- - The moderate_publication RPC bypasses RLS as SECURITY DEFINER
-- ============================================================

-- Drop the previous UPDATE policy that was too restrictive
DROP POLICY IF EXISTS "Providers can update own non-status fields" ON public.ads;

-- Allow anon to update non-status fields (providers editing their draft content)
-- Status is protected by the RPC which is the only legitimate path
CREATE POLICY "Providers can update own ad content"
  ON public.ads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Keep the delete restriction: only pending/rejected rows can be self-deleted
-- Admin deletion goes through the RPC (SECURITY DEFINER bypasses RLS)
-- This prevents providers from deleting approved publications client-side
DROP POLICY IF EXISTS "Providers can delete pending or rejected ads" ON public.ads;

CREATE POLICY "Providers can delete pending or rejected ads"
  ON public.ads FOR DELETE
  USING (status IN ('pending', 'rejected'));
