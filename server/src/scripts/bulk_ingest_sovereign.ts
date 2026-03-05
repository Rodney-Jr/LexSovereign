
import * as fs from 'fs';
import * as path from 'path';
import { JudicialIngestionService } from '../services/JudicialIngestionService';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SOURCE_DIR = 'C:\\Users\\LENOVO\\Desktop\\LexSovereign\\law_knowlege_base\\fg';

async function getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

function getCategory(filePath: string): string {
    const relativePath = path.relative(SOURCE_DIR, filePath).toLowerCase();
    if (relativePath.includes('constitution')) return 'CONSTITUTION';
    if (relativePath.includes('current cases') || relativePath.includes('sc') || relativePath.includes('sca')) return 'CASEFILE';
    if (relativePath.includes('act and decree') || relativePath.includes('ghana law rep')) return 'STATUTE';
    return 'LEGAL_DOC';
}

async function runBulkIngestion() {
    console.log('🚀 Starting Sovereign Bulk Ingestion...');
    console.log('📂 Source:', SOURCE_DIR);

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error('❌ Source directory not found.');
        return;
    }

    const allFiles = await getFiles(SOURCE_DIR);
    const targetFiles = allFiles.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.html', '.htm', '.pdf', '.txt'].includes(ext);
    });

    console.log(`📄 Found ${targetFiles.length} documents to process.`);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < targetFiles.length; i++) {
        const file = targetFiles[i];
        const filename = path.basename(file);
        const category = getCategory(file);
        const progress = Math.round(((i + 1) / targetFiles.length) * 100);

        try {
            // Quick check if file already exists in registry
            const sourceUrl = `upload://${filename}`;
            const existing = await prisma.gazetteEmbedding.findFirst({
                where: { sourceUrl, region: 'GH' },
                select: { id: true }
            });

            if (existing) {
                if (i % 100 === 0 || i < 10) {
                    console.log(`[${progress}%] Skipping (Already Ingested): ${filename}`);
                }
                skipCount++;
                continue;
            }

            console.log(`[${progress}%] Processing (${i + 1}/${targetFiles.length}): ${filename} [${category}]`);

            const buffer = fs.readFileSync(file);
            const result = await JudicialIngestionService.ingestDocument(
                filename,
                buffer,
                category,
                'GH'
            );

            if (result.success) {
                successCount++;
                console.log(`   ✅ Ingested: ${result.chunksCreated} chunks created.`);
            } else {
                failCount++;
                console.error(`   ⚠️ Failed: ${result.error}`);
            }
        } catch (err: any) {
            failCount++;
            console.error(`   ❌ Critical Error processing ${filename}:`, err.message);
        }
    }

    console.log('\n✨ Bulk Ingestion Task Concluded.');
    console.log(`   ✅ Newly Ingested: ${successCount}`);
    console.log(`   ⏭️  Skipped (Existing): ${skipCount}`);
    console.log(`   ⚠️ Failed: ${failCount}`);
}

runBulkIngestion()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
