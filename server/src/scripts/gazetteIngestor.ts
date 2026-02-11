import axios from 'axios';
const pdf = require('pdf-parse');
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function enableVectorExtension() {
    try {
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log("✅ pgvector extension enabled or already exists.");
    } catch (error) {
        console.error("❌ Failed to enable pgvector. Ensure your database user has superuser or appropriate permissions.", error);
    }
}

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
}

function chunkText(text: string, chunkSize: number = 800): string[] {
    // Simple paragraph-based chunking
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

export async function ingestGazette(url: string, region: string, title: string) {
    await enableVectorExtension();

    console.log(`📥 Fetching PDF from: ${url}...`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    const text = data.text;

    console.log(`📄 Parsing complete. Extracted ${text.length} characters.`);
    const chunks = chunkText(text);
    console.log(`✂️ Chunked into ${chunks.length} segments.`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🚀 Processing chunk ${i + 1}/${chunks.length}...`);

        const embedding = await generateEmbedding(chunk);

        // Prisma doesn't support vector types directly in create(), use raw SQL
        const embeddingSql = `[${embedding.join(',')}]`;
        const id = randomUUID();

        await prisma.$executeRawUnsafe(
            `INSERT INTO "GazetteEmbedding" (id, region, title, "contentChunk", embedding, "sourceUrl", "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5::vector, $6, NOW(), NOW())`,
            id, region, title, chunk, embeddingSql, url
        );
    }

    console.log(`✅ Ingestion complete for ${title} (${region}).`);
}

// Example usage if run directly
if (require.main === module) {
    const [, , url, region, title] = process.argv;
    if (!url || !region || !title) {
        console.log("Usage: ts-node gazetteIngestor.ts <url> <region> <title>");
        process.exit(1);
    }
    ingestGazette(url, region, title).catch(console.error);
}
