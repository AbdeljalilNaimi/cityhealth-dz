-- Add publication-specific fields to ads table
ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS doi text,
  ADD COLUMN IF NOT EXISTS pdf_url text;

-- Index for faster publication queries by category
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads (category) WHERE category IS NOT NULL;
