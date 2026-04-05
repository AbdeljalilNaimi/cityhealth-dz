-- Add type column to ads table to distinguish annonces from publications
-- 'annonce': direct-publish, appears only on provider profile
-- 'publication': admin-approved, appears in /annonces public page
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'annonce';

-- Backfill existing rows as 'annonce'
UPDATE public.ads SET type = 'annonce' WHERE type IS NULL OR type = '';
