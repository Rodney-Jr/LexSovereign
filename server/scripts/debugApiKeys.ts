import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
    const keys = await prisma.apiKey.findMany();
    console.log(`Found ${keys.length} API keys:`);
    keys.forEach(k => {
        console.log(`--- KEY START ---`);
        console.log(`ID: ${k.id}`);
        console.log(`Name: ${k.name}`);
        console.log(`Prefix: ${k.prefix}`);
        console.log(`Hash: ${k.keyHash}`);
        console.log(`Active: ${k.isActive}`);
        console.log(`--- KEY END ---`);
    });

    const testRawKey = 'nomos_test_key_747fa54a142c3db4446260549f3dd5875e7e9cd2be83fe5fd067b4d23acbe73f6';
    const testHash = crypto.createHash('sha256').update(testRawKey).digest('hex');
    console.log(`\nVerification:`);
    console.log(`Calculated Hash for testRawKey: ${testHash}`);
    
    const matched = keys.find(k => k.keyHash === testHash);
    console.log(`Match found in DB: ${matched ? 'YES (' + matched.id + ')' : 'NO'}`);
}

run()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
