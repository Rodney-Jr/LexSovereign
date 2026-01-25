
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { prisma } from '../db';

const SOURCE_DIR = 'C:\\Users\\LENOVO\\Desktop\\LexSovereign\\law_knowlege_base\\fg';

async function ingestFiles() {
    console.log('Starting enhanced ingestion from:', SOURCE_DIR);

    const files = await getFiles(SOURCE_DIR);
    console.log(`Found ${files.length} total files. Checking for new content...`);

    let count = 0;
    let skipped = 0;

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();

        // Skip non-target files
        if (!['.html', '.htm', '.pdf', '.docx', '.txt'].includes(ext)) {
            continue;
        }

        try {
            // 1. Duplicate check (Sovereign optimization)
            const existing = await prisma.knowledgeArtifact.findFirst({
                where: { sourceUri: file },
                select: { id: true }
            });

            if (existing) {
                skipped++;
                continue;
            }

            let title = path.basename(file);
            let text = "";
            const category = path.relative(SOURCE_DIR, file).split(path.sep)[0] || 'Uncategorized';

            // 2. Format specific parsing
            if (ext === '.html' || ext === '.htm') {
                const content = fs.readFileSync(file, 'utf-8');
                const $ = cheerio.load(content);
                title = $('title').text().trim() || $('h1').first().text().trim() || title;
                $('script, style').remove();
                text = $('body').text().replace(/\s+/g, ' ').trim();
            }
            else if (ext === '.txt') {
                text = fs.readFileSync(file, 'utf-8').trim();
            }
            else if (ext === '.pdf') {
                try {
                    const pdf = require('pdf-parse');
                    const dataBuffer = fs.readFileSync(file);
                    const data = await pdf(dataBuffer);
                    text = data.text.replace(/\s+/g, ' ').trim();
                } catch (e) {
                    console.warn(`[Library Missing] Could not parse PDF ${file}. Ensure 'pdf-parse' is installed.`);
                    continue;
                }
            }
            else if (ext === '.docx') {
                try {
                    const mammoth = require('mammoth');
                    const result = await mammoth.extractRawText({ path: file });
                    text = result.value.replace(/\s+/g, ' ').trim();
                } catch (e) {
                    console.warn(`[Library Missing] Could not parse DOCX ${file}. Ensure 'mammoth' is installed.`);
                    continue;
                }
            }

            if (text.length < 20) continue;

            // 3. Database Ingestion
            await prisma.knowledgeArtifact.create({
                data: {
                    title: title.substring(0, 255),
                    content: text,
                    category: category,
                    sourceUri: file,
                    lastIndexed: new Date()
                }
            });

            count++;
            if (count % 100 === 0) console.log(`Ingested ${count} new docs... (Skipped ${skipped} existing)`);

        } catch (e) {
            console.error(`Failed to process ${file}:`, e);
        }
    }

    console.log(`Ingestion complete. New: ${count}, Skipped: ${skipped}`);
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
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
