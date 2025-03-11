/**
 * Script to run the complete PDF ingestion process
 * This calls processAllReports from the ingest-pdfs module
 */

// Load environment variables first, before any other imports
import './env-loader';

import path from 'path';
import * as fs from 'fs';
import { processAllReports } from '../lib/rag/processing/ingest-pdfs';

// Ensure we're in the correct directory
const projectRoot = path.resolve(process.cwd());
console.log(`Running from directory: ${projectRoot}`);

// Disable SSL verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log('⚠️ WARNING: SSL certificate verification disabled for testing');

// Configuration from command line arguments or defaults
const args = process.argv.slice(2);
const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '20');
const maxBatches = parseInt(args.find(arg => arg.startsWith('--max-batches='))?.split('=')[1] || 'Infinity');
const delay = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '5000');

console.log(`\nConfiguration: batch size=${batchSize}, max batches=${isNaN(maxBatches) ? 'unlimited' : maxBatches}, delay=${delay}ms`);

// Run the ingestion process
async function runIngestion() {
  try {
    console.log('\n🚀 Starting complete PDF ingestion process...');
    const results = await processAllReports(batchSize, isNaN(maxBatches) ? undefined : maxBatches, delay);
    console.log('\n✅ Process completed successfully!');
    console.log(`Processed ${results.totalProcessed} reports with ${results.totalChunks} total chunks`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running ingestion process:', error);
    process.exit(1);
  }
}

// Execute
runIngestion(); 