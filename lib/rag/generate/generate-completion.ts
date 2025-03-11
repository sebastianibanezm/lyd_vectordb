"use server";

import { OpenAI } from "openai";
import path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`generate-completion.ts: Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Debug API key availability
const apiKey = process.env.OPENAI_API_KEY;
console.log(`generate-completion.ts: OPENAI_API_KEY exists: ${!!apiKey}`);

// Initialize OpenAI with explicit API key
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-missing-check-env',
});

export async function generateCompletionWithContext(context: string[], input: string) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0,
        max_tokens: 2000,
        messages: [
            {
                role: "system", 
                content: `You are a specialized research assistant with expertise in Chilean public policy and access to Libertad y Desarrollo's research repository. Your task is to retrieve relevant information from LYD's publications on the context provided by the user.

When analyzing documents, consider:
1. The publication type (Temas Públicos, Serie Informe, etc.) and its typical depth/format
2. The publication date and potential contextual relevance to current conditions
4. The specific policy recommendations or critiques presented


- Summarize the key arguments and evidence presented
- Identify the main policy recommendations
- Note any distinctive analytical frameworks applied
- Extract relevant data, statistics or case examples

Important: Always reply in Spanish. Never make information up. If its not explicitly written in the documents, don't include it in your response.

Present your findings in a structured format similar to a high quality periodistic article. Maintain fidelity to the original content while organizing it for clarity.
    Context:
    ${context}
    `
            },  
            {role: "user", content: input}
        ],
    });

    return completion.choices[0].message.content;
    }
