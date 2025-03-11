'use server';

import { db } from '@/db';
import { documentsTable } from '@/db/schema/documents-schema';
import { generateEmbeddings } from '../generate/generate-embeddings';
import { splitText } from './split-text';

type DocumentMetadata = {
  [key: string]: any;
};

/**
 * Processes a document by splitting it into chunks, generating embeddings,
 * and storing in the vector database with optional metadata
 */
export async function processDocument(text: string, metadata: DocumentMetadata = {}) {
    // Split the document into chunks
    const chunks = await splitText(text);

    // Generate embeddings for each chunk
    const embeddings = await generateEmbeddings(chunks);
    
    // Insert chunks with embeddings and metadata into the database
    await db.insert(documentsTable).values(
        chunks.map((chunk, i) => ({
            content: chunk,
            embedding: embeddings[i],
            metadata
        }))
    );

    return chunks.length;
}