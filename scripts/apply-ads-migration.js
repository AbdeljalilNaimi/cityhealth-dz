#!/usr/bin/env node
/**
 * Run this script once to apply the pending ads table migrations.
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-key> node scripts/apply-ads-migration.js
 *
 * Find the service role key at:
 *   Supabase Dashboard → Project Settings → API → "service_role" key
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qedotqjxndtmskcgrajt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('    Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-ads-migration.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

const SQL = `
-- Migration 1: Add type column
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'annonce';

-- Set existing rows (old public ads) as publications so they stay visible
UPDATE public.ads SET type = 'publication' WHERE type = 'annonce';

-- Enforce valid values
ALTER TABLE public.ads
  DROP CONSTRAINT IF EXISTS ads_type_check;
ALTER TABLE public.ads
  ADD CONSTRAINT ads_type_check CHECK (type IN ('annonce', 'publication'));

-- Index for frequent filter patterns
CREATE INDEX IF NOT EXISTS ads_type_provider_status_idx
  ON public.ads (type, provider_id, status);

-- Migration 2: Add publication-specific fields
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS doi text,
  ADD COLUMN IF NOT EXISTS pdf_url text;

-- Index for category queries
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads (category) WHERE category IS NOT NULL;
`;

async function run() {
  console.log('Applying migrations to ads table...');
  const { error } = await supabase.rpc('exec_sql', { sql: SQL }).single();

  if (error) {
    // Supabase anon/service clients can execute raw SQL via the pg endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql: SQL }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('❌  Migration failed:', body);
      console.log('\n--- MANUAL SQL TO RUN IN SUPABASE SQL EDITOR ---\n');
      console.log(SQL);
      process.exit(1);
    }
  }

  console.log('✅  Migrations applied successfully!');
  console.log('    The ads table now has: type, category, doi, pdf_url columns.');
}

run().catch((err) => {
  console.error('❌  Unexpected error:', err.message);
  console.log('\n--- MANUAL SQL TO RUN IN SUPABASE SQL EDITOR ---\n');
  console.log(SQL);
  process.exit(1);
});
