'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/db';
import { documentsTable } from '@/db/schema/documents-schema';
import { extractPdfText } from './extract-pdf';
import { splitText } from './split-text';
import { generateEmbeddings } from '../generate/generate-embeddings';

type ReportLYD = {
  id: string;
  title: string;
  theme: string | null;
  publication_date: string | null;
  source: string | null;
  original_url: string;
  pdf_url: string;
  created_at: string;
};

/**
 * Ingests PDFs from Supabase storage into the vector database
 * @param limit Optional limit on number of PDFs to process
 * @param processedIds Set of already processed report IDs to skip
 * @returns Summary of ingestion process
 */
export async function ingestPdfsFromSupabase(
  limit?: number, 
  processedIds: Set<string> = new Set()
) {
  console.log(`Starting PDF ingestion process... ${limit ? `(limit: ${limit})` : '(no limit)'}`);
  console.log(`Already processed: ${processedIds.size} reports`);
  
  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    totalChunks: 0,
    processedIds: [] as string[]
  };

  try {
    // 1. Get records from reports_lyd table, excluding already processed IDs
    const query = supabaseAdmin
      .from('reports_lyd')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Add a filter to exclude already processed IDs if there are any
    if (processedIds.size > 0) {
      const processedIdsArray = Array.from(processedIds);
      // Supabase has a limit on the number of items in a 'not.in' filter
      // So we'll just filter the results in memory if there are too many
      if (processedIdsArray.length < 100) {
        query.filter('id', 'not.in', `(${processedIdsArray.map(id => `"${id}"`).join(',')})`);
      }
    }
    
    if (limit) {
      query.limit(limit);
    }
    
    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }

    // Filter out already processed reports if we couldn't do it in the query
    const filteredReports = processedIds.size >= 100
      ? reports.filter(report => !processedIds.has(report.id))
      : reports;
      
    console.log(`Found ${filteredReports.length} new reports to process`);

    // 2. Process each report
    for (const report of filteredReports) {
      try {
        const chunkCount = await processReport(report as ReportLYD);
        results.processed++;
        results.totalChunks += chunkCount;
        results.processedIds.push(report.id);
        console.log(`Successfully processed report: "${report.title}" (${chunkCount} chunks)`);
      } catch (error) {
        console.error(`Failed to process report "${report.title}":`, error);
        results.failed++;
      }
    }

    console.log('Ingestion summary:', JSON.stringify(results, null, 2));
    return results;
  } catch (error) {
    console.error('Error in PDF ingestion process:', error);
    throw error;
  }
}

/**
 * Processes a single report, downloading its PDF and storing text chunks in the vector DB
 * Uses multiple fallback strategies to download the PDF
 */
export async function processReport(report: ReportLYD) {
  try {
    // 1. Download the PDF using multiple strategies
    console.log(`Downloading PDF for report: ${report.title} (ID: ${report.id})`);
    console.log(`PDF URL: ${report.pdf_url}`);
    
    let pdfBuffer: Buffer | null = null;
    
    // Try multiple strategies to download the PDF
    try {
      // Strategy 1: Direct URL fetch (no auth)
      console.log('Attempting direct fetch...');
      const response = await fetch(report.pdf_url);
      
      if (response.ok) {
        const pdfData = await response.arrayBuffer();
        pdfBuffer = Buffer.from(pdfData);
        console.log(`✅ Direct fetch successful (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`❌ Direct fetch failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.log('Direct fetch error:', error.message);
    }
    
    // Strategy 2: Authenticated fetch with Supabase token
    if (!pdfBuffer) {
      try {
        console.log('Attempting authenticated fetch...');
        const response = await fetch(report.pdf_url, {
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY}`
          }
        });
        
        if (response.ok) {
          const pdfData = await response.arrayBuffer();
          pdfBuffer = Buffer.from(pdfData);
          console.log(`✅ Authenticated fetch successful (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`❌ Authenticated fetch failed: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        console.log('Authenticated fetch error:', error.message);
      }
    }
    
    // Strategy 3: Try to use Supabase storage API directly
    if (!pdfBuffer) {
      try {
        console.log('Attempting Supabase storage download...');
        // Extract bucket path from URL
        const pdfPath = report.pdf_url.replace(/^https:\/\/.*\/storage\/v1\/object\/public\//, '');
        const [bucket, ...pathParts] = pdfPath.split('/');
        const objectPath = pathParts.join('/');
        
        console.log(`Bucket: ${bucket}, Path: ${objectPath}`);
        
        const { data, error } = await supabaseAdmin
          .storage
          .from(bucket)
          .download(objectPath);
          
        if (data && !error) {
          const pdfData = await data.arrayBuffer();
          pdfBuffer = Buffer.from(pdfData);
          console.log(`✅ Supabase storage download successful (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`❌ Supabase storage download failed: ${error?.message}`);
        }
      } catch (error: any) {
        console.log('Supabase storage error:', error.message);
      }
    }
    
    // If all strategies failed, throw an error
    if (!pdfBuffer) {
      throw new Error('All download strategies failed for this PDF');
    }
    
    // 2. Extract text from the PDF
    console.log('Extracting text from PDF...');
    const text = await extractPdfText(pdfBuffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Extracted text is empty');
    }
    
    console.log(`✅ Extracted ${text.length} characters of text`);
    
    // 3. Split the text into chunks
    console.log('Splitting text into chunks...');
    const chunks = await splitText(text);
    console.log(`✅ Split text into ${chunks.length} chunks`);
    
    // 4. Generate embeddings for each chunk
    console.log('Generating embeddings...');
    const embeddings = await generateEmbeddings(chunks);
    console.log(`✅ Generated embeddings for ${chunks.length} chunks`);
    
    // 5. Store each chunk with its embedding in the vector DB
    console.log(`Storing ${chunks.length} chunks in vector DB...`);
    
    // Metadata for storage
    const metadata = {
      reportId: report.id,
      title: report.title,
      theme: report.theme,
      publicationDate: report.publication_date,
      source: report.source || 'LYD',
      pdfUrl: report.pdf_url
    };
    
    // Insert chunks into the documents table
    await db.insert(documentsTable).values(
      chunks.map((chunk, i) => ({
        content: chunk,
        embedding: embeddings[i],
        metadata: metadata
      }))
    );
    
    console.log(`✅ Successfully processed report "${report.title}" (${chunks.length} chunks)`);
    return chunks.length;
  } catch (error) {
    console.error(`❌ Failed to process report "${report.title}":`, error);
    throw error;
  }
}

/**
 * Processes all reports in the reports_lyd table in batches
 * @param batchSize Number of reports to process in each batch
 * @param maxBatches Maximum number of batches to process (undefined for all)
 * @param delayBetweenBatches Delay in milliseconds between batches
 * @returns Summary of the entire ingestion process
 */
export async function processAllReports(
  batchSize: number = 20,
  maxBatches?: number,
  delayBetweenBatches: number = 5000
) {
  console.log(`Starting batch processing of all reports...`);
  console.log(`Batch size: ${batchSize}, Max batches: ${maxBatches || 'unlimited'}, Delay: ${delayBetweenBatches}ms`);
  
  // Load or initialize processed IDs
  const processedIds = new Set<string>();
  
  // Stats tracking
  const overallStats = {
    totalProcessed: 0,
    totalFailed: 0,
    totalChunks: 0,
    batches: 0,
    startTime: new Date(),
    processedIds: [] as string[]
  };
  
  let hasMoreReports = true;
  let batchCounter = 0;
  
  try {
    // First get the total count of reports for progress tracking
    const { count } = await supabaseAdmin
      .from('reports_lyd')
      .select('*', { count: 'exact', head: true });
    
    const totalReports = count || 0;
    console.log(`Found a total of ${totalReports} reports in the database`);
    
    // Process in batches until done or max batches reached
    while (hasMoreReports && (!maxBatches || batchCounter < maxBatches)) {
      console.log(`\n=== Starting batch #${batchCounter + 1} ===`);
      console.log(`Progress: ${processedIds.size}/${totalReports} reports processed (${(processedIds.size / totalReports * 100).toFixed(1)}%)`);
      
      const batchStartTime = Date.now();
      
      // Process the current batch
      const results = await ingestPdfsFromSupabase(batchSize, processedIds);
      
      // Update stats
      batchCounter++;
      overallStats.batches++;
      overallStats.totalProcessed += results.processed;
      overallStats.totalFailed += results.failed;
      overallStats.totalChunks += results.totalChunks;
      
      // Add newly processed IDs to the tracking set
      results.processedIds.forEach(id => {
        processedIds.add(id);
        overallStats.processedIds.push(id);
      });
      
      // Calculate processing rate and remaining time
      const batchTime = (Date.now() - batchStartTime) / 1000; // in seconds
      const reportsRemaining = totalReports - processedIds.size;
      const reportsPerSecond = results.processed / batchTime;
      
      // Print batch summary
      console.log(`=== Batch #${batchCounter} completed in ${batchTime.toFixed(1)}s ===`);
      console.log(`Processed: ${results.processed}, Failed: ${results.failed}, Chunks: ${results.totalChunks}`);
      console.log(`Overall progress: ${processedIds.size}/${totalReports} (${(processedIds.size / totalReports * 100).toFixed(1)}%)`);
      
      if (reportsRemaining > 0 && reportsPerSecond > 0) {
        const remainingTime = reportsRemaining / reportsPerSecond;
        console.log(`Estimated time remaining: ${formatTimeEstimate(remainingTime)} (${reportsPerSecond.toFixed(2)} reports/sec)`);
      }
      
      // Check if we have more to process
      hasMoreReports = results.processed > 0 && processedIds.size < totalReports;
      
      // Delay between batches if we're continuing
      if (hasMoreReports && delayBetweenBatches > 0) {
        console.log(`Waiting ${delayBetweenBatches / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    // Calculate final stats
    const totalTime = (new Date().getTime() - overallStats.startTime.getTime()) / 1000;
    
    // Print final summary
    console.log('\n====================================');
    console.log('🏁 PDF Ingestion Process Complete!');
    console.log('====================================');
    console.log(`Total processed: ${overallStats.totalProcessed}`);
    console.log(`Total failed: ${overallStats.totalFailed}`);
    console.log(`Total chunks: ${overallStats.totalChunks}`);
    console.log(`Total batches: ${overallStats.batches}`);
    console.log(`Total time: ${formatTimeEstimate(totalTime)}`);
    console.log(`Average rate: ${(overallStats.totalProcessed / totalTime).toFixed(2)} reports/sec`);
    console.log(`Final progress: ${processedIds.size}/${totalReports} (${(processedIds.size / totalReports * 100).toFixed(1)}%)`);
    
    return overallStats;
  } catch (error) {
    console.error('Error in batch processing:', error);
    throw error;
  }
}

/**
 * Formats a time estimate in seconds to a human-readable string
 */
function formatTimeEstimate(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)} seconds`;
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)} minutes`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours, ${minutes} minutes`;
  }
} 