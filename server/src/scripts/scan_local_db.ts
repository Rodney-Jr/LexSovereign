
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Check the default local DB for all tables and counts
const localPrisma = new PrismaClient();

// Also try other potential DB names the older scripts may have used
const alternateUrls = [
    'postgresql://postgres:postgres@localhost:5434/lexsovereign',
    'postgresql://postgres:postgres@localhost:5434/nomosdesk_legal',
    'postgresql://postgres:postgres@localhost:5432/nomosdesk',
    'postgresql://postgres:postgres@localhost:5432/lexsovereign',
];

async function checkDb(url: string) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
        const count = await p.gazetteEmbedding.count();
        if (count > 0) {
            const oldest = await p.gazetteEmbedding.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
            console.log(`   ✅ URL: ${url.split('@')[1]} → ${count} records (oldest: ${oldest?.createdAt?.toISOString()})`);
        } else {
            console.log(`   ⚪ URL: ${url.split('@')[1]} → 0 records`);
        }
        return count;
    } catch (err: any) {
        console.log(`   ❌ URL: ${url.split('@')[1]} → Connection Failed: ${err.message.substring(0, 80)}`);
        return -1;
    } finally {
        await p.$disconnect();
    }
}

async function scan() {
    console.log("🔍 Scanning all potential local databases...\n");

    // Primary local DB
    const primary = await localPrisma.gazetteEmbedding.count();
    const primaryArtifacts = await localPrisma.knowledgeArtifact.count();
    console.log(`Primary DB (nomosdesk): ${primary} gazette embeddings, ${primaryArtifacts} knowledge artifacts`);

    if (primary > 0) {
        const oldest = await localPrisma.gazetteEmbedding.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
        console.log(`   Oldest record: ${oldest?.createdAt?.toISOString()}`);
    }

    console.log('\n🔎 Checking alternate databases...');
    for (const url of alternateUrls) {
        await checkDb(url);
    }

    console.log('\n✅ Scan complete.');
}

scan()
    .catch(console.error)
    .finally(async () => { await localPrisma.$disconnect(); });
