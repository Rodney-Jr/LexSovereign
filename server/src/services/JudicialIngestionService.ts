
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as pdf from 'pdf-parse';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface IngestionResult {
    success: boolean;
    filesProcessed: number;
    chunksCreated: number;
    error?: string;
}

export class JudicialIngestionService {

    /**
     * Entry point for ingesting a single document buffer.
     */
    static async ingestDocument(
        filename: string,
        buffer: Buffer,
        category: string,
        region: string = 'GH'
    ): Promise<IngestionResult> {
        try {
            let text = "";
            let title = filename;

            if (filename.endsWith('.html') || filename.endsWith('.htm')) {
                const $ = cheerio.load(buffer.toString('utf-8'));
                title = $('title').text().trim() || $('h1').first().text().trim() || filename;
                $('script, style, nav, footer').remove();
                text = $('body').text().replace(/\s+/g, ' ').trim();
            } else if (filename.endsWith('.pdf')) {
                const data = await (pdf as any)(buffer);
                text = data.text.replace(/\s+/g, ' ').trim();
            } else {
                // Default to plain text
                text = buffer.toString('utf-8').replace(/\s+/g, ' ').trim();
            }

            if (text.length < 100) {
                return { success: false, filesProcessed: 0, chunksCreated: 0, error: 'Document too short or empty.' };
            }

            const chunks = this.chunkText(text);
            let chunksCreated = 0;

            for (const chunk of chunks) {
                const embedding = await this.generateEmbedding(chunk);

                await prisma.gazetteEmbedding.create({
                    data: {
                        region,
                        title: title.substring(0, 255),
                        contentChunk: chunk,
                        embedding: embedding as any,
                        sourceUrl: `upload://${filename}`,
                        metadata: {
                            category,
                            ingestedAt: new Date().toISOString(),
                            method: 'ADMIN_UPLOAD'
                        }
                    }
                });
                chunksCreated++;
            }

            return { success: true, filesProcessed: 1, chunksCreated };

        } catch (error: any) {
            console.error("❌ JudicialIngestionService Error:", error);
            return { success: false, filesProcessed: 0, chunksCreated: 0, error: error.message };
        }
    }

    private static async generateEmbedding(text: string) {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float",
        });
        return response.data[0].embedding;
    }

    private static chunkText(text: string, chunkSize: number = 1000): string[] {
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: string[] = [];
        let currentChunk = "";

        for (const para of paragraphs) {
            if ((currentChunk + para).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            currentChunk += para + "\n\n";
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    static async listDocuments(region: string = 'GH') {
        const docs = await prisma.gazetteEmbedding.findMany({
            where: { region },
            select: {
                id: true,
                title: true,
                metadata: true,
                createdAt: true
            },
            distinct: ['title'],
            orderBy: { createdAt: 'desc' }
        });
        return docs;
    }

    static async deleteDocument(id: string) {
        return await prisma.gazetteEmbedding.delete({
            where: { id }
        });
    }
}
