
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as pdf from 'pdf-parse';
import { EmbeddingService } from './EmbeddingService';

dotenv.config();

const prisma = new PrismaClient();

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
                const { PDFParse } = require('pdf-parse');
                const parser = new PDFParse({ data: buffer });
                const data = await parser.getText();
                await parser.destroy();
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
        return await EmbeddingService.generateEmbedding(text);
    }

    private static chunkText(text: string, chunkSize: number = 2500): string[] {
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: string[] = [];
        let currentChunk = "";

        for (const para of paragraphs) {
            // Fallback for massive single paragraphs that lack newlines
            if (para.length > chunkSize) {
                if (currentChunk.trim().length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }
                for (let i = 0; i < para.length; i += chunkSize) {
                    chunks.push(para.substring(i, i + chunkSize).trim());
                }
                continue;
            }

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
