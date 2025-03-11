'use server';

import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

export async function rankDocuments(query: string, documents: { content: string }[], limit: number = 5) {
    const rerank = await cohere.v2.rerank({
        documents: documents.map((doc) => doc.content),
        query,
        topN: limit,
        model: "rerank-v3.5",
    });
    
    return rerank.results.map((result) => ({
        content: documents[result.index].content,
        relevanceScore: result.relevanceScore
    }));
}