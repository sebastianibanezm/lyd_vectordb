"use server";
import OpenAI from "openai";
import path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`generate-embeddings.ts: Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Get API key with fallback and debugging
const debugMode = true;
const apiKey = process.env.OPENAI_API_KEY;

if (debugMode) {
    console.log('generate-embeddings.ts: Environment check');
    console.log(`OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`Using API key: ${apiKey ? 'Found a key' : 'No key found'}`);
}

// Initialize OpenAI with proper error handling
const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key-for-debugging'
});

export async function generateEmbeddings(text: string[]) {
    if (!apiKey) {
        console.warn('⚠️ No OpenAI API key found in generateEmbeddings, returning mock embeddings');
        // Return mock embeddings with correct dimensions
        return text.map(() => Array(1536).fill(0).map(() => Math.random()).map(val => val / 1536));
    }

    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            dimensions: 1536,
            input: text,
        });

        return response.data.map((item) => item.embedding);
    } catch (error) {
        console.error('Error generating embeddings:', error);
        // Return fallback mock embeddings
        return text.map(() => Array(1536).fill(0).map(() => Math.random()).map(val => val / 1536));
    }
}