/**
 * Environment variable loader
 * This must be imported before any other imports to ensure variables are set
 */

import * as fs from 'fs';
import * as path from 'path';

// Function to load environment variables directly from .env.local
function loadEnvFile() {
  try {
    // Find the .env.local file
    const rootDir = process.cwd();
    const envPath = path.resolve(rootDir, '.env.local');
    
    console.log(`Attempting to load environment variables from: ${envPath}`);
    
    if (!fs.existsSync(envPath)) {
      console.error(`❌ File not found: ${envPath}`);
      return false;
    }
    
    // Read and parse the file content
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    // Set each environment variable
    let loadedVars = 0;
    for (const line of envLines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;
      
      // Split at the first equals sign
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        // Don't override existing environment variables
        if (!process.env[key]) {
          process.env[key] = value;
          loadedVars++;
        }
      }
    }
    
    console.log(`✅ Loaded ${loadedVars} environment variables from .env.local`);
    return true;
  } catch (error) {
    console.error('❌ Error loading environment variables:', error);
    return false;
  }
}

// Load the environment variables
const loaded = loadEnvFile();

// Hard-code essential values if they're missing
if (!process.env.SUPABASE_API_URL) {
  process.env.SUPABASE_API_URL = 'https://mtidkodnaygiwnulizmb.supabase.co';
  console.log('⚠️ Using hardcoded fallback for SUPABASE_API_URL');
}

// Verify essential variables are set
console.log('\nEnvironment Variable Check:');
console.log(`SUPABASE_API_URL: ${process.env.SUPABASE_API_URL ? '✅' : '❌'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
console.log(`SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅' : '❌'}`);

// Export a flag indicating if loading was successful
export const envLoaded = loaded; 