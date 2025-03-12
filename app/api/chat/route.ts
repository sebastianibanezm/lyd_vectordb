import { NextRequest } from 'next/server';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getOptimizedQuery } from '@/lib/rag/retrieval/optimize-query';
import { retrieveDocuments } from '@/lib/rag/retrieval/retrieve-documents';
import { rankDocuments } from '@/lib/rag/retrieval/rerank-documents';
import { generateCompletionWithContext } from '@/lib/rag/generate/generate-completion';

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`API route: Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Configuration for RAG
const MAX_DOCS = 15;
const MIN_SIMILARITY = 0.4;
const TOP_RESULTS = 7;

// Define interfaces for our document types to handle the added properties
interface RetrievedDocument {
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  _contentTrimmed?: string;
}

interface RankedDocument {
  content: string;
  metadata?: Record<string, unknown>;
  relevanceScore: number;
  _contentTrimmed?: string;
}

// Helper function to create an SSE stream
function createSSEStream(text: string, sources?: any[]) {
  return new Response(
    new ReadableStream({
      start(controller) {
        // Format as expected by useCompletion - exactly matching Vercel AI SDK's format
        const payload = {
          text: text,
          sources: sources || []
        };
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    }), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // With useCompletion, we just get the prompt directly
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const query = prompt.trim();
    console.log(`Processing query: "${query}"`);
    
    try {
      // STEP 1: Query Optimization
      console.log('Step 1: Optimizing query');
      const optimizedQuery = await getOptimizedQuery(query);
      console.log(`Optimized query: "${optimizedQuery}"`);
      
      // STEP 2: Document Retrieval
      console.log('Step 2: Retrieving documents');
      const retrievedDocs = await retrieveDocuments(optimizedQuery, {
        limit: MAX_DOCS,
        minSimilarity: MIN_SIMILARITY
      }) as RetrievedDocument[];
      console.log(`Retrieved ${retrievedDocs.length} documents`);
      
      // Debug metadata from retrieved documents
      console.log('Document metadata samples:');
      retrievedDocs.slice(0, 3).forEach((doc, index) => {
        console.log(`Document ${index} metadata:`, doc.metadata);
        // Store a trimmed version of content for matching later
        doc._contentTrimmed = doc.content.trim().substring(0, 100);
      });
      
      // Check if we have any documents before attempting reranking
      if (retrievedDocs.length === 0) {
        const errorMessage = "Lo siento, no he podido encontrar información relevante en nuestra base de datos para responder a tu pregunta. ¿Podrías reformularla o preguntar sobre otro tema relacionado con políticas públicas o algún documento de Libertad y Desarrollo?";
        return createSSEStream(errorMessage);
      }
      
      // STEP 3: Document Reranking
      console.log('Step 3: Reranking documents');
      const rerankedResults = await rankDocuments(optimizedQuery, retrievedDocs, TOP_RESULTS) as RankedDocument[];
      console.log(`Reranked to ${rerankedResults.length} documents`);
      
      // Add trimmed content property to reranked results as well
      rerankedResults.forEach(doc => {
        doc._contentTrimmed = doc.content.trim().substring(0, 100);
      });
      
      if (rerankedResults.length === 0) {
        const errorMessage = "Lo siento, no he podido encontrar información relevante en nuestra base de datos para responder a tu pregunta. ¿Podrías reformularla o preguntar sobre otro tema relacionado con políticas públicas o algún documento de Libertad y Desarrollo?";
        return createSSEStream(errorMessage);
      }
      
      // Extract the content from reranked documents for the completion context
      const context = rerankedResults.map(doc => doc.content);
      
      // Find the corresponding original documents for the reranked results
      const sourcesMetadata = [];
      
      // Process each reranked document and extract metadata directly
      for (const rerankedDoc of rerankedResults) {
        console.log('Processing reranked doc content (first 100 chars):', rerankedDoc.content.substring(0, 100));
        
        // Debug the metadata object directly
        const hasMetadata = rerankedDoc.metadata && typeof rerankedDoc.metadata === 'object' && Object.keys(rerankedDoc.metadata).length > 0;
        console.log(`Reranked doc has metadata: ${hasMetadata ? 'YES' : 'NO'}`);
        
        if (hasMetadata) {
          console.log('Metadata object:', JSON.stringify(rerankedDoc.metadata));
          
          // Convert to proper Record type for easier access
          const metadata = rerankedDoc.metadata as Record<string, any>;
          
          // Check for originalUrl with proper logging
          if (metadata.originalUrl) {
            console.log(`Found originalUrl: ${metadata.originalUrl}`);
            sourcesMetadata.push({
              title: metadata.title || 'Fuente',
              url: metadata.originalUrl
            });
          } else if (metadata.pdfUrl) {
            console.log(`Found pdfUrl: ${metadata.pdfUrl}`);
            sourcesMetadata.push({
              title: metadata.title || 'Fuente',
              url: metadata.pdfUrl
            });
          } else {
            console.log('No URL found in metadata. Keys:', Object.keys(metadata).join(', '));
          }
        } else {
          // Fallback to finding the original document
          console.log('No metadata in reranked doc, looking for matching original doc...');
          
          const originalDoc = retrievedDocs.find(doc => 
            doc.content === rerankedDoc.content || 
            doc._contentTrimmed === rerankedDoc._contentTrimmed
          );
          
          if (originalDoc) {
            const hasOrigMetadata = originalDoc.metadata && Object.keys(originalDoc.metadata).length > 0;
            console.log(`Found matching original doc. Has metadata: ${hasOrigMetadata ? 'YES' : 'NO'}`);
            
            if (hasOrigMetadata) {
              const metadata = originalDoc.metadata as Record<string, any>;
              console.log('Original doc metadata:', JSON.stringify(metadata));
              
              if (metadata.originalUrl) {
                console.log(`Found originalUrl in original doc: ${metadata.originalUrl}`);
                sourcesMetadata.push({
                  title: metadata.title || 'Fuente',
                  url: metadata.originalUrl
                });
              } else if (metadata.pdfUrl) {
                console.log(`Found pdfUrl in original doc: ${metadata.pdfUrl}`);
                sourcesMetadata.push({
                  title: metadata.title || 'Fuente',
                  url: metadata.pdfUrl
                });
              } else {
                console.log('No URL found in original doc metadata. Keys:', Object.keys(metadata).join(', '));
              }
            }
          } else {
            console.log('No matching original document found');
          }
        }
      }
      
      // Remove duplicates
      const uniqueSourcesMetadata = sourcesMetadata.filter((source, index, self) => 
        index === self.findIndex(s => s.url === source.url)
      );
      
      console.log('Final sources metadata:', uniqueSourcesMetadata);
      
      // Generate the answer
      const answer = await generateCompletionWithContext(context, query);
      if (answer === null) {
        console.error('Generated answer is null');
        return createSSEStream("Lo siento, no pude generar una respuesta. Por favor, intenta nuevamente.");
      }
      console.log('Answer generated successfully');
      
      // Return as a properly formatted SSE response with sources
      return createSSEStream(answer, uniqueSourcesMetadata);
    } catch (innerError: any) {
      console.error('Error in RAG pipeline:', innerError);
      
      // Provide a friendly error message to the user
      const errorMessage = "Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta nuevamente en unos momentos.";
      return createSSEStream(errorMessage);
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 