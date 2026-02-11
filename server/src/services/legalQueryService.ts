
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GazetteExcerpt {
    contentChunk: string;
    sourceUrl: string;
    title: string;
    score: number;
}

export class LegalQueryService {
    /**
     * Performs a vector similarity search to find the most relevant statutes.
     */
    static async getRelevantStatutes(query: string, region: string): Promise<GazetteExcerpt[]> {
        try {
            // 1. Generate embedding for the user query
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: query,
                encoding_format: "float",
            });
            const queryEmbedding = response.data[0].embedding;
            const embeddingSql = `[${queryEmbedding.join(',')}]`;

            // 2. Perform Cosine Similarity search using Prisma raw SQL
            // Using the <=> operator for cosine distance (1 - similarity)
            const results: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          "contentChunk", 
          "sourceUrl", 
          title, 
          1 - (embedding <=> $1::vector) as score
        FROM "GazetteEmbedding"
        WHERE region = $2
        ORDER BY embedding <=> $1::vector
        LIMIT 3;
      `, embeddingSql, region);

            return results.map(r => ({
                contentChunk: r.contentChunk,
                sourceUrl: r.sourceUrl,
                title: r.title,
                score: r.score
            }));
        } catch (error) {
            console.error("❌ LegalQueryService Error:", error);
            return [];
        }
    }
}
