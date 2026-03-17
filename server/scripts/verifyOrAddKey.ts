import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
    const agentKey = 'nomos_test_key_ce4aaa17ab0dc6bef28e27a6abe5cc668d197243f1012ce55db60b1da766b4d7a';
    const hash = crypto.createHash('sha256').update(agentKey).digest('hex');
    
    console.log(`Searching for key with hash: ${hash}`);
    
    const key = await prisma.apiKey.findUnique({
        where: { keyHash: hash }
    });
    
    if (key) {
        console.log(`✅ FOUND KEY: ${key.id} (Name: ${key.name}, Active: ${key.isActive})`);
    } else {
        console.log('❌ KEY NOT FOUND IN DB');
        
        // Let's create it explicitly to be sure
        const tenant = await prisma.tenant.findFirst();
        if (tenant) {
            const newKey = await prisma.apiKey.create({
                data: {
                    name: 'Verified Manual Test Key',
                    keyHash: hash,
                    prefix: 'nomos_test',
                    tenantId: tenant.id,
                    isActive: true
                }
            });
            console.log(`Created new verified key: ${newKey.id}`);
        }
    }
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
