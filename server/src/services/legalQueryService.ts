
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { EmbeddingService } from './EmbeddingService';

dotenv.config();

const prisma = new PrismaClient();

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
            if (i >= v2.length) break; // Defensive to avoid overflow
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Performs Retrieval-Augmented Generation (RAG) by fetching candidates
     * and calculating similarity in-memory (Standard PG Fallback).
     * Defaults to OpenAI Embedding generation for the 1536-dim Gazette Repository.
     */
    static async getRelevantStatutes(query: string, region: string, allowedRegion?: string): Promise<GazetteExcerpt[]> {
        try {
            // 1. SILO ENFORCEMENT: If the query region is a sovereign silo (e.g. GH),
            // verify the requesting tenant is pinned to that silo.
            if (region === 'GH' && allowedRegion !== 'GH_ACC_1') {
                console.warn(`[Silo Security] Access Denied: Tenant ${allowedRegion} attempted to query Ghana Silo (GH).`);
                return [];
            }

            // 2. Generate embedding for the user query via EmbeddingService 
            // We explicitly request 'openai' to match the dimension of the gazette repo.
            const queryEmbedding = await EmbeddingService.generateEmbedding(query, 'openai');

            // 3. Fetch candidates for the region from standard JSON storage
            const candidates = await prisma.gazetteEmbedding.findMany({
                where: { region },
                select: {
                    contentChunk: true,
                    sourceUrl: true,
                    title: true,
                    embedding: true
                }
            });

            // 4. Calculate similarity and sort in-memory
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

    /**
     * Performs RAG against a Tenant-Specific repository using Gemini's 768-dim multimodal embeddings.
     */
    static async getRelevantTenantArtifacts(query: string, tenantId: string): Promise<any[]> {
        try {
             // Generate embedding for the user query specifically using 'gemini'
             const queryEmbedding = await EmbeddingService.generateEmbedding(query, 'gemini');

             // Fetch candidates from the tenant-specific knowledge base 
             // (Implementation assumes a model 'TenantArtifactEmbedding' would be added to schema)
             const candidates = await (prisma as any).knowledgeArtifact.findMany({
                 where: { 
                     OR: [
                         { tenantId: tenantId },
                         { isGlobal: true }
                     ]
                 }
             });

             const results = candidates
                .map((c: any) => {
                    const docEmbedding = c.embedding as unknown as number[];
                    // Gemini 768-dim similarity
                    return {
                        id: c.id,
                        title: c.title,
                        content: c.content,
                        score: this.cosineSimilarity(queryEmbedding, docEmbedding)
                    };
                })
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 5);

            return results;
        } catch (error) {
            console.error("❌ Tenant RAG Search Failed:", error);
            return [];
        }
    }
}
