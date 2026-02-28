import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qedotqjxndtmskcgrajt.supabase.co';

export { supabase, SUPABASE_URL };
