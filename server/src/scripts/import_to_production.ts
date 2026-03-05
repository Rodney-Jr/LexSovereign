
/**
 * Production Import Script (Optimized)
 * Uses createMany with skipDuplicates for fast bulk insertion into Railway.
 * 
 * Usage:
 * PROD_DATABASE_URL="postgresql://..." npx ts-node src/scripts/import_to_production.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL || '';

if (!PROD_DATABASE_URL) {
    console.error('❌ PROD_DATABASE_URL is not set.');
    process.exit(1);
}

const prodPrisma = new PrismaClient({
    datasources: { db: { url: PROD_DATABASE_URL } }
});

const EXPORT_DIR = path.resolve(__dirname, '../../data_export');
const BATCH_SIZE = 100;

async function importData() {
    const before = await prodPrisma.gazetteEmbedding.count();
    console.log(`🚀 Production currently has: ${before} embeddings.`);

    const exportFiles = fs.readdirSync(EXPORT_DIR)
        .filter(f => f.startsWith('gazette_embeddings_part'))
        .sort();

    if (exportFiles.length === 0) {
        console.error('❌ No export files found in:', EXPORT_DIR);
        return;
    }

    let totalImported = 0;

    for (const file of exportFiles) {
        console.log(`\n📥 Loading: ${file}`);
        const filePath = path.join(EXPORT_DIR, file);
        const records: any[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`   Found ${records.length} records.`);

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            const progress = Math.round(((i + batch.length) / records.length) * 100);

            try {
                const result = await prodPrisma.gazetteEmbedding.createMany({
                    data: batch.map((r: any) => ({
                        id: r.id,
                        region: r.region,
                        title: r.title,
                        contentChunk: r.contentChunk,
                        embedding: r.embedding,
                        sourceUrl: r.sourceUrl,
                        metadata: r.metadata,
                        createdAt: new Date(r.createdAt),
                        updatedAt: new Date(r.updatedAt),
                    })),
                    skipDuplicates: true,
                });

                totalImported += result.count;
                process.stdout.write(`   [${progress}%] Batch ${Math.ceil((i + 1) / BATCH_SIZE)}: +${result.count} records. Total so far: ${totalImported}\n`);
            } catch (err: any) {
                console.error(`\n   ⚠️ Batch failed:`, err.message);
            }
        }

        console.log(`   ✅ File complete.`);
    }

    const after = await prodPrisma.gazetteEmbedding.count();
    console.log('\n🎉 Import Complete!');
    console.log(`   Before: ${before} → After: ${after}`);
    console.log(`   Net New Records: ${after - before}`);
}

importData()
    .catch(console.error)
    .finally(async () => {
        await prodPrisma.$disconnect();
    });
