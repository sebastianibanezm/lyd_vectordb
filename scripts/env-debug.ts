#!/usr/bin/env ts-node
/**
 * Debug script for environment variables
 * This helps diagnose issues with API keys not being loaded correctly
 */
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
console.log(`Checking for .env.local at: ${envLocalPath}`);
console.log(`File exists: ${fs.existsSync(envLocalPath)}`);

if (fs.existsSync(envLocalPath)) {
  console.log(`Loading environment from ${envLocalPath}`);
  dotenv.config({ path: envLocalPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Log API key presence (not the actual values)
console.log('\nEnvironment variable check:');
console.log(`OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
console.log(`COHERE_API_KEY exists: ${!!process.env.COHERE_API_KEY}`);

// Display env vars in the child process environment
console.log('\nProcess environment overview:');
console.log(`Total environment variables: ${Object.keys(process.env).length}`);
console.log('Common environment variables:');
[
  'NODE_ENV', 'PATH', 'HOME', 'USER', 
  'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
].forEach(key => {
  console.log(`- ${key}: ${process.env[key] ? 'Present' : 'Missing'}`);
});

// Special check for "use server" mode
console.log('\nChecking TypeScript "use server" mode environment:');

// Export function has been simplified as we no longer need to copy between variable names
export function checkApiKeyVariables() {
  console.log('Checking API key variables');
  console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Present' : 'Missing'}`);
}

// Run the main function
async function main() {
  console.log('\nEnvironment debugging complete!');
}

main().catch(err => {
  console.error('Error in debug script:', err);
  process.exit(1);
}); 