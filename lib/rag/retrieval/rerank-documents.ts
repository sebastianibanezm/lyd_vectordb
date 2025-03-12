'use server';

import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

export async function rankDocuments(query: string, documents: { content: string, metadata?: any }[], limit: number = 5) {
    // Debug log input documents
    console.log(`rerank-documents.ts: Reranking ${documents.length} documents`);
    console.log('rerank-documents.ts: Checking metadata in input documents');
    documents.forEach((doc, i) => {
        const hasMetadata = doc.metadata && Object.keys(doc.metadata).length > 0;
        console.log(`rerank-documents.ts: Input document ${i + 1} has metadata: ${hasMetadata ? 'YES' : 'NO'}`);
        if (hasMetadata) {
            console.log(`rerank-documents.ts: Metadata keys: ${Object.keys(doc.metadata).join(', ')}`);
        }
    });
    
    const rerank = await cohere.v2.rerank({
        documents: documents.map((doc) => doc.content),
        query,
        topN: limit,
        model: "rerank-v3.5",
    });
    
    const results = rerank.results.map((result) => {
        const originalDoc = documents[result.index];
        const hasMetadata = originalDoc.metadata && Object.keys(originalDoc.metadata).length > 0;
        
        console.log(`rerank-documents.ts: Reranked document index ${result.index} has metadata: ${hasMetadata ? 'YES' : 'NO'}`);
        
        return {
            content: originalDoc.content,
            metadata: originalDoc.metadata,
            relevanceScore: result.relevanceScore
        };
    });
    
    return results;
}