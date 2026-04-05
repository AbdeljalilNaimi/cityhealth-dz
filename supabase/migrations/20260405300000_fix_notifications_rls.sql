-- Allow anon to insert notifications (admin panel uses anon key)
-- Admin identity is enforced by Firebase auth at the application layer
DROP POLICY IF EXISTS "Service inserts notifications" ON public.ad_notifications;

CREATE POLICY "Allow inserting notifications"
  ON public.ad_notifications FOR INSERT
  WITH CHECK (true);
