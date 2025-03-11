/**
 * Database connection setup
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`db/index.ts: Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('db/index.ts: No .env.local file found, using process environment');
  dotenv.config();
}

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  throw new Error('DATABASE_URL is required');
}

// Create postgres connection
console.log(`db/index.ts: Connecting to database with connection string (partially hidden): ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create drizzle database instance
export const db = drizzle(client);

// Export PostgreSQL client for direct queries if needed
export const sql = client; 