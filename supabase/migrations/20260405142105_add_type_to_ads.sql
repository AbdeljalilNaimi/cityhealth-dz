-- Add type column to ads table to distinguish annonces from publications
-- 'annonce': direct-publish, appears only on provider profile
-- 'publication': admin-approved, appears in /annonces public page
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'annonce';

-- Existing rows were part of the old public /annonces feed → treat as 'publication'
-- so they remain visible on the public page until the new Publications system is in place.
UPDATE public.ads SET type = 'publication' WHERE type = 'annonce';

-- Add a check constraint to enforce valid values
ALTER TABLE public.ads
  DROP CONSTRAINT IF EXISTS ads_type_check;
ALTER TABLE public.ads
  ADD CONSTRAINT ads_type_check CHECK (type IN ('annonce', 'publication'));

-- Index for frequent filter patterns on type+provider_id+status
CREATE INDEX IF NOT EXISTS ads_type_provider_status_idx
  ON public.ads (type, provider_id, status);
