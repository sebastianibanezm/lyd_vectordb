import {index, jsonb, pgTable, serial, text, timestamp, vector} from "drizzle-orm/pg-core";

export const documentsTable = pgTable("documents", 
    {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    embedding: vector("embedding", {
        dimensions: 1536   
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, 
(table) => ({
    embedding_index: index("documents_embedding_index").using(
        "hnsw",
        table.embedding.op("vector_cosine_ops")
    )
}));

export type InsertDocument = typeof documentsTable.$inferInsert;
export type SelectDocument = typeof documentsTable.$inferSelect;