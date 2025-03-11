import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing database connection...');
  console.log(`Using connection string (partially hidden): ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Create a postgres client with a timeout of 10 seconds
    const sql = postgres(process.env.DATABASE_URL!, {
      idle_timeout: 10,
      connect_timeout: 10,
      max_lifetime: 60 * 60
    });
    
    // Test the connection
    const result = await sql`SELECT NOW() as time`;
    console.log('Connection successful!');
    console.log('Current database time:', result[0].time);
    
    // Close the connection
    await sql.end();
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 