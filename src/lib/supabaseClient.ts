import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oxudqytwcxsbonioxuyw.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dWRxeXR3Y3hzYm9uaW94dXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIxNzIsImV4cCI6MjA4NzY5ODE3Mn0.Zz-dzYyZe6AAVkOLY17j44zJ6laOX0JIRav2nBthzJc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export { SUPABASE_URL };
