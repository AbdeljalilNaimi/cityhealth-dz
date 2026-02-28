// Re-export from the canonical Supabase client
export { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export { SUPABASE_URL };
