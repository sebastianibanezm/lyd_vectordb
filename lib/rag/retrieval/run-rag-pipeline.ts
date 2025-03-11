'use server';

import { getOptimizedQuery } from "./optimize-query";
import { retrieveDocuments } from "./retrieve-documents";
import { rankDocuments } from "./rerank-documents";

export async function runRagPipeline(query: string) {
    const optimizedQuery = await getOptimizedQuery(query);
    console.log('Optimized Query:', optimizedQuery);

    const retrieveDocs = await retrieveDocuments(optimizedQuery, {
        limit: 25,
        minSimilarity: 0.4
    });

    console.log('Retrieved Documents:', retrieveDocs.length);

    const rerankedResults = await rankDocuments(optimizedQuery, retrieveDocs, 5);
    console.log('Reranked Documents:', rerankedResults);

    return rerankedResults;
}



    