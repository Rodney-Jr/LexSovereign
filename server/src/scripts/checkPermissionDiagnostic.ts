
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const permissions = [
        'manage_tenant', 'manage_users', 'manage_roles',
        'read_billing', 'read_all_audits', 'create_matter'
    ];

    console.log('Checking permissions...');
    for (const id of permissions) {
        const p = await prisma.permission.findUnique({ where: { id } });
        console.log(`${id}: ${p ? 'FOUND' : 'MISSING'}`);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
