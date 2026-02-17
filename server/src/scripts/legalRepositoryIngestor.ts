
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SOURCE_DIR = path.resolve(__dirname, '../../../law_knowlege_base/fg');

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
}

function chunkText(text: string, chunkSize: number = 1000): string[] {
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

function getCategory(filePath: string): string {
    const relativePath = path.relative(SOURCE_DIR, filePath).toLowerCase();
    if (relativePath.includes('constitution')) return 'CONSTITUTION';
    if (relativePath.includes('current cases') || relativePath.includes('sc') || relativePath.includes('sca')) return 'CASEFILE';
    if (relativePath.includes('act and decree') || relativePath.includes('ghana law rep')) return 'STATUTE';
    return 'LEGAL_DOC';
}

async function ingestFiles() {
    console.log('🚀 Starting Ghana Legal Repository Ingestion from:', SOURCE_DIR);

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error('❌ Source directory does not exist:', SOURCE_DIR);
        return;
    }

    const files = await getFiles(SOURCE_DIR);
    console.log(`📂 Found ${files.length} total files. Filtering for HTML...`);

    const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.htm'));
    console.log(`📄 Processing ${htmlFiles.length} HTML files...`);

    let count = 0;
    let chunkCount = 0;

    for (const file of htmlFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const $ = cheerio.load(content);

            // Extract clean title and text
            const title = $('title').text().trim() || $('h1').first().text().trim() || path.basename(file);
            $('script, style, nav, footer').remove();
            const text = $('body').text().replace(/\s+/g, ' ').trim();

            if (text.length < 200) {
                console.log(`⏩ Skipping short file: ${path.basename(file)}`);
                continue;
            }

            const category = getCategory(file);
            const chunks = chunkText(text);

            console.log(`➡️  Processing: [${category}] ${title} (${chunks.length} chunks)`);

            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk);

                await prisma.gazetteEmbedding.create({
                    data: {
                        region: 'GH',
                        title: title.substring(0, 255),
                        contentChunk: chunk,
                        embedding: embedding as any,
                        sourceUrl: path.relative(path.resolve(__dirname, '../../../'), file),
                        metadata: {
                            category,
                            ingestedAt: new Date().toISOString()
                        }
                    }
                });
                chunkCount++;
            }

            count++;
            if (count % 10 === 0) console.log(`✅ Progress: ${count}/${htmlFiles.length} files ingested (${chunkCount} total chunks)`);

        } catch (e: any) {
            console.error(`❌ Failed to process ${file}:`, e.message);
        }
    }

    console.log(`✨ Ingestion complete! ${count} files, ${chunkCount} chunks added to the Enclave Registry.`);
}

async function getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

ingestFiles()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
