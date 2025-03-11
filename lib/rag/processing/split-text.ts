'use server';

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function splitText(text: string) {
    try {
        // Create an instance of RecursiveCharacterTextSplitter
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 50,
            separators: ["\n\n", "\n", " ", ""], // Default separators, starting with highest level of organization
        });

        // Split the text into chunks
        const chunks = await textSplitter.splitText(text);
        
        return chunks;
    } catch (error) {
        console.error("Error splitting text:", error);
        throw error;
    }
}