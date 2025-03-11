#!/usr/bin/env ts-node
/**
 * RAG Pipeline Test
 * 
 * This script tests the full RAG pipeline:
 * 1. Query Optimization
 * 2. Document Retrieval with vector similarity
 * 3. Document Reranking
 * 4. Answer Generation with LLM
 */

import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables early
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Debug environment variables
console.log('\nEnvironment variables:');
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
console.log(`Current working directory: ${process.cwd()}`);

// Import the RAG pipeline components
try {
  // Import modules with proper error handling
  const { getOptimizedQuery } = require('../lib/rag/retrieval/optimize-query');
  const { retrieveDocuments } = require('../lib/rag/retrieval/retrieve-documents');
  const { rankDocuments } = require('../lib/rag/retrieval/rerank-documents');
  const { generateCompletionWithContext } = require('../lib/rag/generate/generate-completion');
} catch (error) {
  console.error('❌ Error importing modules:', error);
  process.exit(1);
}

// Redefine the imports after the error handling
import { getOptimizedQuery } from '../lib/rag/retrieval/optimize-query';
import { retrieveDocuments } from '../lib/rag/retrieval/retrieve-documents';
import { rankDocuments } from '../lib/rag/retrieval/rerank-documents';
import { generateCompletionWithContext } from '../lib/rag/generate/generate-completion';

// WARNING: Only for development/testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log('⚠️ WARNING: SSL certificate verification disabled for testing');

// Configuration
const VERBOSE = true;
const MAX_DOCS = 15;
const MIN_SIMILARITY = 0.4;
const TOP_RESULTS = 10;

// Create readline interface for interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Logging utility
function logVerbose(message: string, data: any = null) {
  if (!VERBOSE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  console.log(`[${timestamp}] 🔍 ${message}`);
  
  if (data !== null) {
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        console.log(`   📊 ${data.length} items total`);
        const sample = data.slice(0, 3);
        console.log('   📋 Sample:', JSON.stringify(sample, null, 2).split('\n').map(line => '      ' + line).join('\n'));
        if (data.length > 3) {
          console.log(`      ... ${data.length - 3} more items`);
        }
      } else {
        const stringified = JSON.stringify(data, null, 2);
        if (stringified.length > 1000) {
          console.log('   📋 Data: ' + stringified.substring(0, 1000) + '... (truncated)');
        } else {
          console.log('   📋 Data:', stringified.split('\n').map(line => '      ' + line).join('\n'));
        }
      }
    } else {
      console.log(`   📋 ${data}`);
    }
  }
}

// Test the complete RAG pipeline
async function testRagPipeline(query: string) {
  console.log(`\n🔍 Testing RAG with query: "${query}"`);
  
  try {
    // STEP 1: Query Optimization
    console.log('\n===== STEP 1: QUERY OPTIMIZATION =====');
    logVerbose('Optimizing query with getOptimizedQuery()', { originalQuery: query });
    const startOptimizationTime = Date.now();
    
    const optimizedQuery = await getOptimizedQuery(query);
    
    const optimizationTime = Date.now() - startOptimizationTime;
    console.log(`✓ Query optimized in ${optimizationTime}ms`);
    console.log(`Original: "${query}"`);
    console.log(`Optimized: "${optimizedQuery}"`);
    
    // STEP 2: Document Retrieval
    console.log('\n===== STEP 2: DOCUMENT RETRIEVAL =====');
    logVerbose('Retrieving documents with retrieveDocuments()', {
      query: optimizedQuery,
      limit: MAX_DOCS,
      minSimilarity: MIN_SIMILARITY
    });
    const startRetrievalTime = Date.now();
    
    const retrievedDocs = await retrieveDocuments(optimizedQuery, {
      limit: MAX_DOCS,
      minSimilarity: MIN_SIMILARITY
    });
    
    const retrievalTime = Date.now() - startRetrievalTime;
    console.log(`✓ Retrieved ${retrievedDocs.length} documents in ${retrievalTime}ms`);
    
    if (retrievedDocs.length > 0) {
      // Log sample similarities
      const similarities = retrievedDocs.map((doc: { similarity?: number }) => 
        doc.similarity !== undefined ? Number(doc.similarity).toFixed(4) : 'N/A'
      );
      console.log(`Similarity scores: ${similarities.slice(0, 5).join(', ')}${similarities.length > 5 ? '...' : ''}`);
      
      // Log a preview of the first document
      if (retrievedDocs[0]?.content) {
        const preview = retrievedDocs[0].content.substring(0, 100) + '...';
        console.log(`First document preview: "${preview}"`);
      }
    }
    
    // STEP 3: Document Reranking
    console.log('\n===== STEP 3: DOCUMENT RERANKING =====');
    logVerbose('Reranking documents with rankDocuments()', {
      query: optimizedQuery,
      documentCount: retrievedDocs.length,
      topN: TOP_RESULTS
    });
    const startRerankingTime = Date.now();
    
    const rerankedResults = await rankDocuments(optimizedQuery, retrievedDocs, TOP_RESULTS);
    
    const rerankingTime = Date.now() - startRerankingTime;
    console.log(`✓ Reranked to ${rerankedResults.length} documents in ${rerankingTime}ms`);
    
    // Display reranked results
    console.log('\n===== RERANKED RESULTS =====');
    if (rerankedResults.length === 0) {
      console.log('No relevant results found');
    } else {
      rerankedResults.forEach((result, index) => {
        console.log(`\n📄 Result #${index + 1} (Score: ${result.relevanceScore?.toFixed(4) || 'N/A'})`);
        
        // Display content excerpt
        let contentPreview = result.content?.substring(0, 250) || 'No content available';
        if (contentPreview.length >= 250) contentPreview += '...';
        
        console.log(`Content: ${contentPreview}`);
      });
    }
    
    // STEP 4: Answer Generation
    if (rerankedResults.length > 0) {
      console.log('\n===== STEP 4: ANSWER GENERATION =====');
      logVerbose('Generating answer with generateCompletionWithContext()', {
        contextDocsCount: rerankedResults.length,
        query: query
      });
      const startGenerationTime = Date.now();
      
      // Extract context from results and generate completion
      const context = rerankedResults.map(doc => doc.content);
      const answer = await generateCompletionWithContext(context, query);
      
      const generationTime = Date.now() - startGenerationTime;
      console.log(`✓ Generated answer in ${generationTime}ms`);
      
      console.log('\n===== FINAL ANSWER =====');
      console.log(answer);
      
      // Process summary
      console.log('\n===== PROCESS SUMMARY =====');
      const totalTime = optimizationTime + retrievalTime + rerankingTime + generationTime;
      console.log(`⏱️ Pipeline timing:`);
      console.log(`   Optimization: ${optimizationTime}ms`);
      console.log(`   Retrieval: ${retrievalTime}ms`);
      console.log(`   Reranking: ${rerankingTime}ms`);
      console.log(`   Generation: ${generationTime}ms`);
      console.log(`   Total: ${totalTime}ms`);
      
      console.log(`📊 Documents: ${retrievedDocs.length} retrieved → ${rerankedResults.length} after reranking`);
      console.log('✅ RAG pipeline test completed successfully!');
    } else {
      console.log('\n⚠️ No documents found for generating an answer');
    }
    
    // At the end of the function, add a visual separator
    console.log('\n' + '='.repeat(80));
    console.log('Ready for next question!');
    
    return {
      optimizedQuery,
      retrievedCount: retrievedDocs.length,
      rerankedCount: rerankedResults.length,
      timing: {
        optimization: optimizationTime,
        retrieval: retrievalTime,
        reranking: rerankingTime,
        total: optimizationTime + retrievalTime + rerankingTime
      }
    };
  } catch (error: any) {
    console.error('❌ Error in RAG pipeline:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return null;
  }
}

// Interactive query function
async function askQuery() {
  try {
    console.log('\n💬 Interactive Mode: Ask any question or type "exit" to quit');
    const answer = await new Promise<string>(resolve => {
      rl.question('\nEnter your query: ', resolve);
    });
    
    if (answer.toLowerCase() === 'exit') {
      console.log('\nThank you for using the RAG Pipeline Test. Goodbye!');
      rl.close();
      return;
    }
    
    if (!answer.trim()) {
      console.log('Query cannot be empty. Please try again.');
      await askQuery();
      return;
    }
    
    await testRagPipeline(answer);
    await askQuery(); // Continue asking for queries
  } catch (error: any) {
    console.error('Error in interactive mode:', error.message);
    rl.close();
  }
}

// Main function
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🤖 Complete RAG Pipeline Test');
  console.log('============================');
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`Cohere API Key: ${process.env.COHERE_API_KEY ? '✅' : '❌'}`);
  console.log(`Verbose Logging: ${VERBOSE ? '✅' : '❌'}`);
  
  // Ensure we have required API keys
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OpenAI API key. Please set OPENAI_API_KEY environment variable.');
    process.exit(1);
  }
  
  if (!process.env.COHERE_API_KEY) {
    console.warn('⚠️ Missing Cohere API key. The reranking step may fail.');
  }
  
  try {
    // Check if a query was provided as a command line argument
    const args = process.argv.slice(2);
    const initialQuery = args.join(' ');
    
    if (initialQuery) {
      console.log(`\nProcessing initial query: "${initialQuery}"`);
      await testRagPipeline(initialQuery);
    }
    
    // Always enter interactive mode after processing the initial query (if any)
    await askQuery();
  } catch (err: any) {
    console.error('Unhandled error:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 