import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sukhdbuokxrrsylxtdvr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1a2hkYnVva3hycnN5bHh0ZHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzk0MTMsImV4cCI6MjEwMjgxNTQxM30.Nh3w6_6sA1ZjfhkCdPOQDeJmlGui-_i5WOkuwqNUDy0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
