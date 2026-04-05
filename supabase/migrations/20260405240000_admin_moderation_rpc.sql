-- ============================================================
-- Secure admin moderation RPC using SECURITY DEFINER
-- The moderator_token is verified inside this function.
-- The expected token is encoded in the function body itself,
-- which is inaccessible to regular SQL queries.
-- ============================================================

CREATE OR REPLACE FUNCTION public.moderate_publication(
  p_action TEXT,
  p_ad_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_moderator_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected_token CONSTANT TEXT := 'c9cdf433e738493844964594677e7152313224055adae1efc2ac96027419ad49';
  v_ad RECORD;
  v_notification_type TEXT;
  v_notification_msg TEXT;
BEGIN
  -- Verify the token
  IF p_moderator_token IS NULL OR p_moderator_token != v_expected_token THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- Fetch the ad
  SELECT provider_id, title, status INTO v_ad
  FROM public.ads
  WHERE id = p_ad_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'AD_NOT_FOUND';
  END IF;

  -- Perform the action
  CASE p_action
    WHEN 'approve' THEN
      UPDATE public.ads
      SET status = 'approved', rejection_reason = NULL
      WHERE id = p_ad_id;
      v_notification_type := 'approved';
      v_notification_msg := 'Votre publication a été approuvée et est maintenant visible sur la page /annonces.';

    WHEN 'reject' THEN
      UPDATE public.ads
      SET status = 'rejected',
          rejection_reason = COALESCE(p_reason, 'Non conforme aux règles de la plateforme')
      WHERE id = p_ad_id;
      v_notification_type := 'rejected';
      v_notification_msg := COALESCE(p_reason, 'Non conforme aux règles de la plateforme');

    WHEN 'suspend' THEN
      UPDATE public.ads
      SET status = 'suspended'
      WHERE id = p_ad_id;
      v_notification_type := 'suspended';
      v_notification_msg := 'Votre publication a été suspendue.';

    WHEN 'delete' THEN
      DELETE FROM public.ads WHERE id = p_ad_id;
      RETURN jsonb_build_object('success', true, 'action', 'deleted');

    ELSE
      RAISE EXCEPTION 'UNKNOWN_ACTION: %', p_action;
  END CASE;

  -- Insert notification
  INSERT INTO public.ad_notifications (
    provider_id, ad_id, ad_title, type, message
  ) VALUES (
    v_ad.provider_id, p_ad_id, v_ad.title,
    v_notification_type, v_notification_msg
  );

  RETURN jsonb_build_object('success', true, 'action', p_action);
END;
$$;

GRANT EXECUTE ON FUNCTION public.moderate_publication TO anon;
GRANT EXECUTE ON FUNCTION public.moderate_publication TO authenticated;
