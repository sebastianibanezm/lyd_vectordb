import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables directly if needed
function loadEnvDirectly() {
  if (process.env.SUPABASE_API_URL) {
    return; // Already loaded
  }
  
  try {
    const rootDir = process.cwd();
    const envPath = path.resolve(rootDir, '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.error(`Environment file not found: ${envPath}`);
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.trim().startsWith('#') || !line.trim()) continue;
      
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    console.log('Loaded environment variables directly from .env.local');
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Try to load environment variables
loadEnvDirectly();

// Try different environment variables in order of preference
let supabaseUrl = process.env.SUPABASE_API_URL || process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

// Debug logging for environment variables
if (!supabaseUrl) {
  console.error('❌ Missing Supabase URL! Available environment variables:', {
    SUPABASE_API_URL: !!process.env.SUPABASE_API_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
  
  // Hard-code if needed
  console.log('Using fallback Supabase URL');
  supabaseUrl = 'https://mtidkodnaygiwnulizmb.supabase.co';
  console.log(`Fallback URL: ${supabaseUrl}`);
} 

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase key! Available environment variables:', {
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_KEY: !!process.env.SUPABASE_KEY,
  });
}

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

// Create a Supabase client with the service role key for admin access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Create a public client with anonymous access
export const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey
); 