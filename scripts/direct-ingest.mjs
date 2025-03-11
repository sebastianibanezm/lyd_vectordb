// Direct ingestion script that bypasses the Next.js API
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Parse command line arguments
const args = process.argv.slice(2);
const MAX_BATCHES_ARG = args.find(arg => arg.startsWith('--max-batches='));
const BATCH_SIZE_ARG = args.find(arg => arg.startsWith('--batch-size='));
const DELAY_ARG = args.find(arg => arg.startsWith('--delay='));
const USE_MOCK_EMBEDDINGS = args.includes('--use-mock-embeddings');
const USE_COHERE = args.includes('--use-cohere');

// TEMPORARY FIX: Disable SSL certificate verification 
// NOTE: This is not recommended for production use, but helps with local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log('⚠️ WARNING: SSL certificate verification is disabled for testing purposes');

// Get the directory of the current module and resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.resolve(rootDir, '.env.local');

// Load environment variables from .env.local file
console.log(`📂 Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Configuration
const BATCH_SIZE = BATCH_SIZE_ARG ? parseInt(BATCH_SIZE_ARG.split('=')[1], 10) : 5;
const MAX_BATCHES = MAX_BATCHES_ARG ? parseInt(MAX_BATCHES_ARG.split('=')[1], 10) : 5;
const DELAY_BETWEEN_BATCHES = DELAY_ARG ? parseInt(DELAY_ARG.split('=')[1], 10) : 5000;
const LOG_FILE = 'direct-ingestion-log.json'; // File to store progress and results
const STORAGE_BUCKET = 'lyd-reports'; // Name of the Supabase storage bucket
const EMBEDDING_DIMENSIONS = 1536; // Dimensions for embeddings

// Display configuration
console.log('\n⚙️ Configuration:');
console.log(`   - Max batches: ${MAX_BATCHES}`);
console.log(`   - Batch size: ${BATCH_SIZE}`);
console.log(`   - Delay between batches: ${DELAY_BETWEEN_BATCHES / 1000} seconds`);
console.log(`   - Using mock embeddings: ${USE_MOCK_EMBEDDINGS ? '✅ Yes' : '❌ No'}`);
console.log(`   - Using Cohere embeddings: ${USE_COHERE ? '✅ Yes' : '❌ No'}`);
console.log(`   - Log file: ${LOG_FILE}`);

// For Supabase REST API, we need the URL and key - use the correct environment variable names
const supabaseUrl = process.env.SUPABASE_API_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check environment variables
console.log('🔄 Environment check:');
console.log(`   - Using Supabase URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'} (${supabaseUrl || 'undefined'})`);
console.log(`   - Using Supabase Key: ${supabaseKey ? '✅ Found' : '❌ Missing'} (${supabaseKey ? supabaseKey.substring(0, 3) + '...' : 'undefined'})`);
console.log(`   - Using OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing'} (${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) + '...' : 'undefined'})`);

// List all available environment variables for debugging (with sensitive values masked)
console.log('\n📋 Available environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE') || key.includes('NEXT_PUBLIC') || key.includes('OPENAI') || key.includes('OPEN_AI') || key.includes('NODE_TLS')) {
    const value = process.env[key];
    const maskedValue = value ? (key.includes('KEY') ? value.substring(0, 3) + '...' : value) : 'undefined';
    console.log(`   - ${key}: ${maskedValue}`);
  }
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   - SUPABASE_API_URL');
  if (!supabaseKey) console.error('   - SUPABASE_KEY');
  console.error(`\nPlease check your environment variables in ${envPath}`);
  process.exit(1);
}

// Configure Supabase client with options for better debugging
console.log(`🔌 Creating Supabase client with URL: ${supabaseUrl}`);
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (...args) => {
        console.log(`🌐 Making fetch request to: ${args[0]}`);
        return fetch(...args);
      }
    }
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
  process.exit(1);
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    const { count, error } = await supabase
      .from('reports_lyd')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error);
      return false;
    }
    
    console.log(`✅ Successfully connected to Supabase! Found ${count} reports in total.`);
    return true;
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    return false;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Import the required processing functions
// We need to dynamically import these because they use 'use server' directive
// which isn't compatible with direct node.js execution
async function extractPdfText(pdfBuffer) {
  try {
    // Import the pdf-parse library properly
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    
    // Use the imported function correctly
    const data = await pdfParse.default(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

async function splitText(text) {
  const { RecursiveCharacterTextSplitter } = await import('langchain/text_splitter');
  try {
    // Create an instance of RecursiveCharacterTextSplitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 50,
      separators: ["\n\n", "\n", " ", ""], // Default separators, starting with highest level of organization
    });

    // Split the text into chunks
    const chunks = await textSplitter.splitText(text);
    return chunks;
  } catch (error) {
    console.error("Error splitting text:", error);
    throw error;
  }
}

// Function to generate mock embeddings for testing
function generateMockEmbeddings(count) {
  console.log(`Generating ${count} mock embeddings...`);
  return Array(count).fill(0).map(() => {
    // Generate a vector of EMBEDDING_DIMENSIONS random values that sum to 1 (for cosine similarity)
    const vector = Array(EMBEDDING_DIMENSIONS).fill(0).map(() => Math.random());
    const sum = vector.reduce((a, b) => a + b, 0);
    return vector.map(v => v / sum);
  });
}

async function generateEmbeddings(texts) {
  // If using mock embeddings, return random vectors
  if (USE_MOCK_EMBEDDINGS) {
    return generateMockEmbeddings(texts.length);
  }
  
  // If using OpenAI embeddings
  if (!USE_COHERE) {
    const { OpenAI } = await import('openai');
    
    // Use the standardized environment variable name
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    try {
      console.log(`Generating embeddings for ${texts.length} chunks using OpenAI...`);
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        dimensions: EMBEDDING_DIMENSIONS,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings with OpenAI:', error);
      throw error;
    }
  } 
  // If using Cohere embeddings
  else {
    try {
      console.log(`Generating embeddings for ${texts.length} chunks using Cohere...`);
      const { CohereClient } = await import('cohere-ai');
      
      const cohereApiKey = process.env.COHERE_API_KEY;
      
      if (!cohereApiKey) {
        throw new Error('Cohere API key is missing. Please set the COHERE_API_KEY environment variable.');
      }
      
      const cohere = new CohereClient({
        token: cohereApiKey,
      });
      
      // Process in batches of 96 (Cohere limit)
      const COHERE_BATCH_SIZE = 96;
      let allEmbeddings = [];
      
      for (let i = 0; i < texts.length; i += COHERE_BATCH_SIZE) {
        const batchTexts = texts.slice(i, i + COHERE_BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / COHERE_BATCH_SIZE) + 1} of ${Math.ceil(texts.length / COHERE_BATCH_SIZE)} (${batchTexts.length} texts)`);
        
        const response = await cohere.embed({
          texts: batchTexts,
          model: 'embed-multilingual-v3.0',
          inputType: 'search_document',
        });
        
        if (response && response.embeddings) {
          allEmbeddings.push(...response.embeddings);
        } else {
          throw new Error('Failed to get embeddings from Cohere API');
        }
      }
      
      return allEmbeddings;
    } catch (error) {
      console.error('Error generating embeddings with Cohere:', error);
      throw error;
    }
  }
}

async function storeInVectorDb(chunks, embeddings, metadata) {
  try {
    // Direct insert into the documents table instead of using RPC
    const documents = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      metadata: metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert documents in batches of 10 to avoid potential size limits
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(documents.length / batchSize)} (${batch.length} documents)`);
      
      const { error } = await supabase
        .from('documents')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`Successfully inserted ${insertedCount} of ${documents.length} documents`);
    }
    
    return chunks.length;
  } catch (error) {
    console.error('Error storing in vector database:', error);
    throw error;
  }
}

async function processReport(report) {
  try {
    console.log(`Processing report: "${report.title}"`);
    
    // Extract the bucket and path from the PDF URL
    const fullPath = report.pdf_url.replace(/^https:\/\/.*\/storage\/v1\/object\/public\//, '');
    const pathParts = fullPath.split('/');
    const bucket = pathParts[0];
    const path = fullPath.substring(bucket.length + 1);
    
    console.log(`  - PDF URL: ${report.pdf_url}`);
    console.log(`  - Bucket: ${bucket}`);
    console.log(`  - Path: ${path}`);
    
    // 1. Download the PDF from Supabase storage
    const { data: pdfData, error: pdfError } = await supabase
      .storage
      .from(bucket)
      .download(path);

    if (pdfError || !pdfData) {
      console.error(`Error downloading PDF ${report.pdf_url}:`, pdfError);
      
      // Fallback method: Try using direct fetch
      console.log(`Attempting fallback download method for "${report.title}"...`);
      try {
        const response = await fetch(report.pdf_url, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convert the response to a Blob
        const blob = await response.blob();
        console.log(`Successfully downloaded PDF using fallback method: ${blob.size} bytes`);
        
        // Convert Blob to Buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const text = await extractPdfText(buffer);
        
        // Continue processing as normal
        const chunks = await splitText(text);
        const embeddings = await generateEmbeddings(chunks);
        
        // Prepare metadata
        const metadata = {
          reportId: report.id,
          title: report.title,
          theme: report.theme,
          publicationDate: report.publication_date,
          source: report.source,
          originalUrl: report.original_url,
          pdfUrl: report.pdf_url
        };
        
        // Store in vector database
        await storeInVectorDb(chunks, embeddings, metadata);
        
        console.log(`Successfully processed: ${chunks.length} chunks for "${report.title}" (using fallback method)`);
        return chunks.length;
      } catch (fallbackError) {
        console.error(`Fallback method also failed for "${report.title}":`, fallbackError);
        throw new Error(`Failed to download PDF using all methods`);
      }
    }

    // 2. Convert Blob to Buffer and extract text from the PDF
    const arrayBuffer = await pdfData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractPdfText(buffer);
    
    // 3. Split text into chunks
    const chunks = await splitText(text);
    
    // 4. Generate embeddings for chunks
    const embeddings = await generateEmbeddings(chunks);
    
    // 5. Prepare metadata from the report
    const metadata = {
      reportId: report.id,
      title: report.title,
      theme: report.theme,
      publicationDate: report.publication_date,
      source: report.source,
      originalUrl: report.original_url,
      pdfUrl: report.pdf_url
    };
    
    // 6. Store in vector database
    await storeInVectorDb(chunks, embeddings, metadata);
    
    console.log(`Successfully processed: ${chunks.length} chunks for "${report.title}"`);
    return chunks.length;
  } catch (error) {
    console.error(`Failed to process report "${report.title}":`, error);
    throw error;
  }
}

async function processReports() {
  console.log('🔍 Starting direct PDF ingestion...');
  
  // Create log file to track progress
  let log = { 
    startTime: new Date().toISOString(),
    processedIds: [],
    batches: [],
    totalProcessed: 0,
    totalFailed: 0,
    totalChunks: 0,
    completed: false
  };
  
  try {
    // Test Supabase connection before starting
    const connectionSuccessful = await testSupabaseConnection();
    if (!connectionSuccessful) {
      throw new Error('Failed to connect to Supabase. Please check your credentials and try again.');
    }
    
    // Get all records from reports_lyd table
    const processedIds = new Set();
    let batchNum = 0;
    let hasMoreReports = true;
    
    while (hasMoreReports && batchNum < MAX_BATCHES) {
      batchNum++;
      console.log(`\n🔄 Processing batch ${batchNum}...`);
      
      try {
        // Build query to fetch reports
        let query = supabase
          .from('reports_lyd')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(BATCH_SIZE);
        
        // Only add the 'not in' filter if we have processed IDs
        // This avoids the "failed to parse filter (not.in.)" error
        if (processedIds.size > 0) {
          const processedIdsArray = Array.from(processedIds);
          
          // Only use the filter if we have a reasonable number of IDs
          // Supabase has a limit on the number of items in a 'not.in' filter
          if (processedIdsArray.length > 0 && processedIdsArray.length < 100) {
            console.log(`   - Excluding ${processedIdsArray.length} already processed reports`);
            query = query.filter('id', 'not.in', `(${processedIdsArray.map(id => `"${id}"`).join(',')})`);
          } else if (processedIdsArray.length >= 100) {
            console.log(`   - Too many processed IDs (${processedIdsArray.length}) to use in filter, will filter client-side`);
          }
        }
        
        // Execute the query
        const { data: reports, error } = await query;
        
        if (error) {
          console.error('Error fetching reports:', error);
          log.batches.push({
            batchNum,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
          
          // Try to continue with next batch rather than stopping completely
          console.log('⚠️ Continuing to next batch after error...');
          await sleep(DELAY_BETWEEN_BATCHES);
          continue;
        }
        
        // Filter out already processed reports if we couldn't do it in the query
        let reportsToProcess = reports;
        if (processedIds.size >= 100 && reports) {
          reportsToProcess = reports.filter(report => !processedIds.has(report.id));
          console.log(`   - Filtered out ${reports.length - reportsToProcess.length} already processed reports client-side`);
        }
        
        // Check if we have more reports to process
        if (!reportsToProcess || reportsToProcess.length === 0) {
          console.log('✅ No more reports to process!');
          hasMoreReports = false;
          break;
        }
        
        console.log(`Found ${reportsToProcess.length} reports to process in this batch`);
        
        // Batch results
        const batchResults = {
          processed: 0,
          failed: 0,
          chunks: 0,
          ids: []
        };
        
        // Process each report in the batch
        for (const report of reportsToProcess) {
          try {
            const chunkCount = await processReport(report);
            batchResults.processed++;
            batchResults.chunks += chunkCount;
            batchResults.ids.push(report.id);
            processedIds.add(report.id);
            log.processedIds.push(report.id);
            
            // Update running totals
            log.totalProcessed++;
            log.totalChunks += chunkCount;
          } catch (error) {
            console.error(`Failed to process report "${report.title}":`, error);
            batchResults.failed++;
            log.totalFailed++;
          }
        }
        
        // Update log with batch results
        log.batches.push({
          batchNum,
          status: 'success',
          processed: batchResults.processed,
          failed: batchResults.failed,
          chunks: batchResults.chunks,
          timestamp: new Date().toISOString()
        });
        
        // Save log after each batch
        fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
        
        console.log(`✅ Batch ${batchNum} completed:`);
        console.log(`   - Processed: ${batchResults.processed}`);
        console.log(`   - Failed: ${batchResults.failed}`);
        console.log(`   - Total chunks: ${batchResults.chunks}`);
        console.log(`   - Running total: ${log.totalProcessed} reports processed`);
        
        if (hasMoreReports) {
          console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
          await sleep(DELAY_BETWEEN_BATCHES);
        }
      } catch (batchError) {
        console.error(`❌ Fatal error processing batch ${batchNum}:`, batchError);
        log.batches.push({
          batchNum,
          status: 'failed',
          error: batchError.message,
          timestamp: new Date().toISOString()
        });
        fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
        
        // Try to continue with next batch
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Mark ingestion as completed
    log.completed = true;
    log.endTime = new Date().toISOString();
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
    
    console.log('\n🎉 Direct ingestion completed!');
    console.log(`📊 Final statistics:`);
    console.log(`   - Total processed: ${log.totalProcessed}`);
    console.log(`   - Total failed: ${log.totalFailed}`);
    console.log(`   - Total chunks: ${log.totalChunks}`);
    console.log(`   - Success rate: ${log.totalProcessed > 0 ? Math.round(log.totalProcessed / (log.totalProcessed + log.totalFailed) * 100) : 0}%`);
    console.log(`   - Log file: ${LOG_FILE}`);
    
  } catch (error) {
    console.error('❌ Error during ingestion process:', error);
    
    // Save error state to log
    log.error = error.message;
    log.endTime = new Date().toISOString();
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
    
    process.exit(1);
  }
}

// Update the main execution to include a proper async handler
(async function main() {
  try {
    await processReports();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})(); 