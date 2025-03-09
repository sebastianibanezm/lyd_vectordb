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
 * @param offset Starting point in the reports_lyd table
 * @returns Summary of ingestion process
 */
export async function ingestPdfsFromSupabase(
  limit?: number, 
  processedIds: Set<string> = new Set(),
  offset: number = 0
) {
  console.log(`Starting PDF ingestion process... ${limit ? `(limit: ${limit})` : '(no limit)'}, offset: ${offset}`);
  console.log(`Already processed: ${processedIds.size} reports`);
  
  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    totalChunks: 0,
    processedIds: [] as string[],
    hasMore: false  // Flag to indicate if there are more reports to process
  };

  try {
    // 1. Get records from reports_lyd table, excluding already processed IDs
    const query = supabaseAdmin
      .from('reports_lyd')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply range-based pagination with offset
    if (limit) {
      query.range(offset, offset + limit - 1);
    }
    
    console.log(`Fetching reports ${offset} to ${offset + (limit || 1000) - 1} from database...`);
    const { data: reports, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Set flag to indicate if there are potentially more records
    // If we got a full batch of the requested size, assume there could be more
    results.hasMore = reports.length === limit;
    
    // Post-query filtering for already processed IDs
    const filteredReports = processedIds.size > 0 
      ? reports.filter(report => !processedIds.has(report.id))
      : reports;
    
    console.log(`Found ${filteredReports.length} new reports to process out of ${reports.length} fetched`);

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
        // We still add the ID to processed to avoid repeated failures
        results.processedIds.push(report.id);
      }
    }

    return results;
  } catch (error) {
    console.error("Error in PDF ingestion process:", error);
    throw error;
  }
}

/**
 * Processes a single report, downloading its PDF and storing text chunks in the vector DB
 * Uses multiple fallback strategies to download the PDF
 */
export async function processReport(report: ReportLYD) {
  console.log(`Downloading PDF for report: ${report.title} (ID: ${report.id})`);
  console.log(`PDF URL: ${report.pdf_url}`);
  
  let pdfBuffer: Buffer | null = null;
  
  try {
    // Attempt direct fetch first (no auth)
    console.log("Attempting direct fetch...");
    try {
      const response = await fetch(report.pdf_url);
      if (!response.ok) {
        throw new Error(`Direct fetch failed with status: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
      console.log(`✅ Direct fetch successful (${sizeKB} KB)`);
    } catch (error: any) {
      console.log(`❌ Direct fetch failed: ${error.message}`);
      
      // Try authenticated fetch
      console.log("Attempting authenticated fetch...");
      try {
        const supabaseToken = supabaseAdmin.auth.getSession();
        const response = await fetch(report.pdf_url, {
          headers: {
            Authorization: `Bearer ${supabaseToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Auth fetch failed with status: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
        const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
        console.log(`✅ Authenticated fetch successful (${sizeKB} KB)`);
      } catch (authError: any) {
        console.log(`❌ Authenticated fetch failed: ${authError.message}`);
        
        // Final attempt using Supabase storage
        console.log("Attempting Supabase storage download...");
        try {
          // Extract bucket and object path from URL
          const url = new URL(report.pdf_url);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'object');
          
          if (bucketIndex === -1 || bucketIndex + 2 >= pathParts.length) {
            throw new Error("Could not parse storage URL properly");
          }
          
          const bucket = pathParts[bucketIndex + 2];
          const objectPath = pathParts.slice(bucketIndex + 3).join('/');
          
          const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .download(objectPath);
            
          if (error) throw error;
          
          pdfBuffer = Buffer.from(await data.arrayBuffer());
          const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
          console.log(`✅ Supabase storage download successful (${sizeKB} KB)`);
        } catch (storageError: any) {
          console.log(`❌ Supabase storage download failed: ${storageError.message}`);
          throw new Error("All download methods failed");
        }
      }
    }
    
    console.log("Extracting text from PDF...");
    const text = await extractPdfText(pdfBuffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error("Extracted text is empty");
    }
    
    console.log(`Successfully extracted ${text.length} characters of text`);
    
    // Split text into chunks
    const chunks: string[] = await splitText(text);
    console.log(`Split text into ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      throw new Error("No chunks created from text");
    }
    
    // Generate embeddings for all chunks at once using the generateEmbeddings function
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const embeddings: number[][] = await generateEmbeddings(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);
    
    // Create metadata
    const metadata = {
      title: report.title,
      reportId: report.id,
      theme: report.theme,
      publicationDate: report.publication_date,
      source: report.source || 'LYD',
      pdfUrl: report.pdf_url
    };
    
    // Double-check sanitization before database insertion
    const sanitizedChunks = chunks.map((chunk: string) => {
      // Remove any remaining null bytes or problematic characters
      return chunk.replace(/\0/g, '')
                  .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    });
    
    console.log(`Storing ${sanitizedChunks.length} chunks in vector DB...`);
    
    try {
      // Insert chunks into the documents table
      await db.insert(documentsTable).values(
        sanitizedChunks.map((chunk: string, i: number) => ({
          content: chunk,
          embedding: embeddings[i],
          metadata: metadata
        }))
      );
      
      console.log(`✅ Successfully processed report "${report.title}" (${chunks.length} chunks)`);
      return chunks.length;
    } catch (dbError) {
      console.error(`❌ Database insertion error for "${report.title}":`, dbError);
      
      // Try to insert chunks one by one to identify problematic ones
      console.log("Attempting to insert chunks individually...");
      let successCount = 0;
      
      for (let i = 0; i < sanitizedChunks.length; i++) {
        try {
          await db.insert(documentsTable).values({
            content: sanitizedChunks[i],
            embedding: embeddings[i],
            metadata: metadata
          });
          successCount++;
        } catch (singleInsertError: any) {
          console.error(`Failed to insert chunk ${i+1}/${sanitizedChunks.length}: ${singleInsertError.message}`);
        }
      }
      
      if (successCount > 0) {
        console.log(`⚠️ Partially processed report "${report.title}" (${successCount}/${chunks.length} chunks)`);
        return successCount;
      } else {
        throw new Error(`Failed to insert any chunks for report "${report.title}"`);
      }
    }
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
  let currentOffset = 0;
  
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
      
      // Process the current batch with offset for pagination
      const results = await ingestPdfsFromSupabase(batchSize, processedIds, currentOffset);
      
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
      
      // Update the offset for the next batch
      currentOffset += batchSize;
      
      // Check if we have more to process
      // We consider three conditions:
      // 1. The batch returned more results than zero (processed > 0)
      // 2. We haven't processed all reports according to the total count
      // 3. The batch indicates there are more results available
      hasMoreReports = (
        results.processed > 0 && 
        processedIds.size < totalReports &&
        (results.hasMore || currentOffset < totalReports)
      );
      
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
    console.log(`Progress: ${processedIds.size}/${totalReports} (${(processedIds.size / totalReports * 100).toFixed(1)}%)`);
    
    if (processedIds.size < totalReports) {
      console.log(`\n⚠️ Note: Not all reports were processed. ${totalReports - processedIds.size} reports remain.`);
      console.log(`To continue processing, run the script again.`);
    }
    
    return {
      totalProcessed: overallStats.totalProcessed,
      totalFailed: overallStats.totalFailed,
      totalChunks: overallStats.totalChunks,
      batches: overallStats.batches,
      totalTime
    };
  } catch (error) {
    console.error('Error processing reports:', error);
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