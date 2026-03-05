
import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL || '';

if (!PROD_DATABASE_URL) {
    console.error('❌ PROD_DATABASE_URL is not set.');
    process.exit(1);
}

const prodPrisma = new PrismaClient({
    datasources: { db: { url: PROD_DATABASE_URL } }
});

async function checkCount() {
    const count = await prodPrisma.gazetteEmbedding.count();
    console.log(`✅ Production Gazette Embeddings: ${count}`);
    const sample = await prodPrisma.gazetteEmbedding.findFirst({
        select: { id: true, title: true, region: true, createdAt: true }
    });
    if (sample) console.log('Sample record:', JSON.stringify(sample, null, 2));
}

checkCount()
    .catch(console.error)
    .finally(async () => { await prodPrisma.$disconnect(); });
