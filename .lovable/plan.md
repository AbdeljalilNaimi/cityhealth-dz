

## Fix: Supabase client crash due to missing environment variables

### Confirmed Root Cause
Browser console shows: **`Error: supabaseUrl is required.`** at `client.ts:7:25`.  
The `.env` file that should contain `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` does not exist in the project. The auto-generated `client.ts` calls `createClient(undefined, undefined)`, which throws synchronously and kills the entire app.

### Constraint
`src/integrations/supabase/client.ts` is auto-generated and **cannot be edited**. The `.env` file is also supposed to be auto-managed.

### Fix Strategy
Use Vite's `define` option in `vite.config.ts` to inject the Supabase credentials as compile-time constants. This ensures `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` are always defined, even when the `.env` file is missing. These are **publishable keys** (anon key), safe to embed in client-side code.

### Changes

**1. `vite.config.ts`** — Add `define` block with fallback env values

Add inside the config object:
```ts
define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
    process.env.VITE_SUPABASE_URL || 'https://qedotqjxndtmskcgrajt.supabase.co'
  ),
  'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZG90cWp4bmR0bXNrY2dyYWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYwOTksImV4cCI6MjA4Nzg3MjA5OX0.PlCld0g_4ccvxIUWqAO8FebK0myYGK2EZZySHUUMBGQ'
  ),
  'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(
    process.env.VITE_SUPABASE_PROJECT_ID || 'qedotqjxndtmskcgrajt'
  ),
},
```

This acts as a safety net: if the `.env` file is restored later, it will take precedence (Vite loads `.env` before applying `define` only for non-`import.meta.env` keys — but for `import.meta.env.*`, `define` takes priority, so this guarantees the values are always present).

These are the same public/anon credentials already visible in the project configuration.

### What this fixes
- Homepage crash on both preview and published versions
- All pages that import the Supabase client (34 files)
- No changes needed to any component code

