'use server';

import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbeddings } from "../generate/generate-embeddings";
import * as path from 'path';
import * as fs from 'fs';

// Import database and schema using relative paths
// These will work both in Next.js and in direct script execution
import { db } from "../../../db";
import { documentsTable } from "../../../db/schema/documents-schema";

export async function retrieveDocuments(input: string, options: { limit?: number, minSimilarity?: number } = {}) {
    const { limit = 10, minSimilarity = 0.4 } = options;

    console.log(`retrieve-documents.ts: Generating embeddings for input: "${input}"`);
    const embeddings = await generateEmbeddings([input]);
    console.log(`retrieve-documents.ts: Generated embeddings, searching database...`);

    const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;

    try {
        const documents = await db
        .select({
            content: documentsTable.content,
            metadata: documentsTable.metadata,
            similarity
        })
        .from(documentsTable)
        .where(gt(similarity, minSimilarity))
        .orderBy((t) => desc(t.similarity))
        .limit(limit);
        
        console.log(`retrieve-documents.ts: Retrieved ${documents.length} documents`);
        
        // Add debug logging for metadata
        console.log('retrieve-documents.ts: Checking metadata in retrieved documents');
        documents.forEach((doc, i) => {
            const hasMetadata = doc.metadata && Object.keys(doc.metadata).length > 0;
            console.log(`retrieve-documents.ts: Document ${i + 1} has metadata: ${hasMetadata ? 'YES' : 'NO'}`);
            if (hasMetadata) {
                console.log(`retrieve-documents.ts: Metadata keys: ${Object.keys(doc.metadata).join(', ')}`);
                if (doc.metadata.originalUrl) {
                    console.log(`retrieve-documents.ts: Found originalUrl: ${doc.metadata.originalUrl}`);
                }
            }
        });
        
        return documents;
    } catch (error) {
        console.error("Error retrieving documents:", error);
        throw error;
    }
}


    