-- Add keywords column to ads table for publication search/tagging
ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS keywords text;
