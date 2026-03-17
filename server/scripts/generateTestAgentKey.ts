import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
    const rawKey = 'nomos_test_key_' + crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Get a tenant to attach this to
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error("No tenant found in DB.");
        process.exit(1);
    }

    const apiKey = await prisma.apiKey.create({
        data: {
            name: 'Local Dev Test Agent Sync',
            keyHash: hash,
            tenantId: tenant.id,
            prefix: rawKey.substring(0, 10),
            isActive: true
        }
    });

    console.log(`Created test API Key for Tenant ${tenant.id}`);
    console.log(`RAW_KEY_TO_USE_IN_ENV=${rawKey}`);
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
