-- Drop the intermediate moderate_publication RPC that used a hardcoded token.
-- Admin moderation is now handled exclusively by the moderate-publication Edge Function
-- which verifies Firebase admin identity server-side using the service role.
DROP FUNCTION IF EXISTS public.moderate_publication(TEXT, UUID, TEXT, TEXT);
