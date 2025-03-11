'use server';

import OpenAI from "openai";
import path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`optimize-query.ts: Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
}

// More robust API key handling with debug info
const debugMode = true;
const apiKey = process.env.OPENAI_API_KEY;

if (debugMode) {
    console.log('optimize-query.ts: Environment check');
    console.log(`OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`Using API key: ${apiKey ? 'Found a key' : 'No key found'}`);
}

// Handle missing API key gracefully
if (!apiKey) {
    console.error('Missing OpenAI API Key! Please set OPENAI_API_KEY in your environment.');
}

const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key-to-prevent-crash-debugging-only' // Fallback for debugging
});

// Wrapper function with fallback for missing API key
export async function getOptimizedQuery(query: string) {
    // If API key is missing, just return the original query
    if (!apiKey) {
        console.warn('⚠️ No OpenAI API key found, skipping query optimization.');
        return query;
    }
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant tasked with optimizing queries for a RAG (Retrieval-Augmented Generation) system. Your goal is to refine the original query to improve the retrieval of relevant information from the knowledge base.

Follow these guidelines to optimize the query:

1.Remove unnecessary words or phrases that don't contribute to the core meaning.

2.Identify and emphasize key concepts or entities.

3.Use more specific or technical terms if appropriate.

4.Ensure the query is clear and concise.

5.Maintain the original intent of the query.

Output only the refined query text, without any additional explanation or formatting, on a single line.

Example:

Original query: "What is the capital of France?"
Optimized query: "France capital"

Original query: "Explain the process of photosynthesis in plants."
Optimized query: "Photosynthesis in plants"

Original query: "What are the main features of the latest iPhone model?"
Optimized query: "iPhone latest model features"

Original query: "How to fix a broken window?"
Optimized query: "window repair"

Original query: "What are the benefits of using renewable energy sources?"  
Optimized query: "renewable energy benefits"

Original query: "What is the main idea of the book '1984'?"
Optimized query: "1984 book main idea"
`
                },
                {
                    role: 'user',
                    content: query
                }
            ]
        });

        console.log('Query optimization successful!');
        return response.choices[0].message.content ?? query;
    } catch (error) {
        console.error('Error during query optimization:', error);
        console.log('Falling back to original query');
        return query;
    }
}