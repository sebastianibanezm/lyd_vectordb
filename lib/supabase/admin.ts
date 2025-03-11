import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_KEY || '';

// Create a Supabase client with the service role key for admin access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}); 