import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Import database and schema
import { db } from '@/db';
import { documentsTable } from '@/db/schema/documents-schema';

async function checkDocs() {
  try {
    console.log('Connecting to database...');
    const docs = await db.select({
      metadata: documentsTable.metadata
    }).from(documentsTable).limit(3);
    
    console.log('Sample document metadata:');
    docs.forEach((doc, i) => {
      console.log(`Doc ${i + 1}:`, JSON.stringify(doc.metadata, null, 2));
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

// Run the check
checkDocs()
  .then(() => console.log('Done'))
  .catch(err => console.error('Unhandled error:', err)); 