-- =============================================================
-- Admin moderation security for publications
-- Uses SECURITY DEFINER RPCs + trigger to block direct status
-- mutations through the anon client key
-- =============================================================

-- ── 1. App config (moderator secret — not readable by anon) ──
CREATE TABLE IF NOT EXISTS public.app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No anon read on app_config" ON public.app_config;
CREATE POLICY "No anon read on app_config" ON public.app_config
  FOR ALL USING (false);

-- Store moderator secret (idempotent)
INSERT INTO public.app_config (key, value)
  VALUES ('moderator_secret', '4ecc636305311ddb04f106ffa687135e845b76b6677fa161')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── 2. Secret verifier ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_moderator_secret(p_secret TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE stored TEXT;
BEGIN
  SELECT value INTO stored FROM public.app_config WHERE key = 'moderator_secret';
  RETURN stored IS NOT NULL AND stored = p_secret;
END;
$$;

-- ── 3. Trigger: block direct status/rejection changes via anon ──
-- We use a session-local flag set by SECURITY DEFINER RPCs
CREATE OR REPLACE FUNCTION public.guard_publication_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if status/rejection_reason haven't changed
  IF (NEW.status IS NOT DISTINCT FROM OLD.status)
     AND (NEW.rejection_reason IS NOT DISTINCT FROM OLD.rejection_reason) THEN
    RETURN NEW;
  END IF;
  -- Allow if the RPC has set the bypass flag for this transaction
  IF current_setting('app.admin_bypass', true) = 'on' THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Status changes require admin authorization';
END;
$$;

DROP TRIGGER IF EXISTS guard_publication_status ON public.ads;
CREATE TRIGGER guard_publication_status
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_publication_status_change();

-- ── 4. Admin moderation RPCs (SECURITY DEFINER) ─────────────

-- Approve
CREATE OR REPLACE FUNCTION public.admin_approve_publication(
  p_ad_id UUID,
  p_secret TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_moderator_secret(p_secret) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  PERFORM set_config('app.admin_bypass', 'on', true);
  UPDATE public.ads
    SET status = 'approved', rejection_reason = NULL, updated_at = NOW()
    WHERE id = p_ad_id AND type = 'publication';
  INSERT INTO public.ad_notifications (provider_id, ad_id, ad_title, type, message)
    SELECT provider_id, id, title, 'approved',
           'Votre publication a été approuvée et est maintenant visible.'
      FROM public.ads WHERE id = p_ad_id;
END;
$$;

-- Reject
CREATE OR REPLACE FUNCTION public.admin_reject_publication(
  p_ad_id UUID,
  p_reason TEXT,
  p_secret TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_moderator_secret(p_secret) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  PERFORM set_config('app.admin_bypass', 'on', true);
  UPDATE public.ads
    SET status = 'rejected', rejection_reason = p_reason, updated_at = NOW()
    WHERE id = p_ad_id AND type = 'publication';
  INSERT INTO public.ad_notifications (provider_id, ad_id, ad_title, type, message)
    SELECT provider_id, id, title, 'rejected',
           'Votre publication a été rejetée. Raison : ' || COALESCE(p_reason, 'Non précisée')
      FROM public.ads WHERE id = p_ad_id;
END;
$$;

-- Suspend
CREATE OR REPLACE FUNCTION public.admin_suspend_publication(
  p_ad_id UUID,
  p_secret TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_moderator_secret(p_secret) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  PERFORM set_config('app.admin_bypass', 'on', true);
  UPDATE public.ads
    SET status = 'suspended', updated_at = NOW()
    WHERE id = p_ad_id AND type = 'publication';
  INSERT INTO public.ad_notifications (provider_id, ad_id, ad_title, type, message)
    SELECT provider_id, id, title, 'suspended',
           'Votre publication a été suspendue par l''administrateur.'
      FROM public.ads WHERE id = p_ad_id;
END;
$$;

-- Delete
CREATE OR REPLACE FUNCTION public.admin_delete_publication(
  p_ad_id UUID,
  p_secret TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_moderator_secret(p_secret) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.ads WHERE id = p_ad_id;
END;
$$;

-- Toggle featured (no bypass needed — not a status change)
CREATE OR REPLACE FUNCTION public.admin_toggle_featured_pub(
  p_ad_id UUID,
  p_featured BOOLEAN,
  p_secret TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.check_moderator_secret(p_secret) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.ads SET is_featured = p_featured, updated_at = NOW()
    WHERE id = p_ad_id;
END;
$$;

