-- ============================================================
-- Add 'submitted' notification type to ad_notifications check
-- and create a trigger to auto-notify on publication submission
-- ============================================================

-- Drop the existing check constraint and recreate with 'submitted' type
ALTER TABLE public.ad_notifications
  DROP CONSTRAINT IF EXISTS ad_notifications_type_check;

ALTER TABLE public.ad_notifications
  ADD CONSTRAINT ad_notifications_type_check
  CHECK (type IN ('approved', 'rejected', 'suspended', 'submitted'));

-- Trigger function: auto-create "submitted" notification when a publication is inserted
CREATE OR REPLACE FUNCTION public.on_publication_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'publication' AND NEW.status = 'pending' THEN
    INSERT INTO public.ad_notifications (
      provider_id, ad_id, ad_title, type, message
    ) VALUES (
      NEW.provider_id,
      NEW.id,
      NEW.title,
      'submitted',
      'Votre publication a été reçue et sera examinée par notre équipe sous 24 à 48 h.'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_publication_submitted
  AFTER INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.on_publication_submitted();
