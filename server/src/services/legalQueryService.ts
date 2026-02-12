
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
     * Performs a cosine similarity calculation between two vectors.
     */
    private static cosineSimilarity(v1: number[], v2: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            normA += v1[i] * v1[i];
            normB += v2[i] * v2[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Performs Retrieval-Augmented Generation (RAG) by fetching candidates
     * and calculating similarity in-memory (Standard PG Fallback).
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

            // 2. Fetch candidates for the region from standard JSON storage
            const candidates = await prisma.gazetteEmbedding.findMany({
                where: { region },
                select: {
                    contentChunk: true,
                    sourceUrl: true,
                    title: true,
                    embedding: true
                }
            });

            // 3. Calculate similarity and sort in-memory
            const results = candidates
                .map(c => {
                    const docEmbedding = c.embedding as unknown as number[];
                    return {
                        contentChunk: c.contentChunk,
                        sourceUrl: c.sourceUrl || "",
                        title: c.title,
                        score: this.cosineSimilarity(queryEmbedding, docEmbedding)
                    };
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            return results;
        } catch (error) {
            console.error("❌ LegalQueryService Error:", error);
            return [];
        }
    }
}
