import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Required Permissions (TenantService) ---');
    
    const requiredIds = [
        'MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE',
        'VIEW_BILLING:TENANT', 'VIEW_STATS:TENANT', 'CREATE:MATTER',
        'VIEW:CLIENT', 'CREATE:CLIENT', 'UPLOAD:DOCUMENT',
        'CREATE:DRAFT', 'EDIT:DRAFT', 'USE:CHAT',
        'EXECUTE:AI', 'ACCESS:HR', 'ACCESS:ACCOUNTING',
        'VIEW:MATTER', 'CHECK:CONFLICTS'
    ];

    const existing = await prisma.permission.findMany({
        where: { id: { in: requiredIds } }
    });

    const existingIds = existing.map(p => p.id);
    const missing = requiredIds.filter(id => !existingIds.includes(id));

    if (missing.length > 0) {
        console.error('❌ Missing Permissions:', missing);
    } else {
        console.log('✅ All required permissions exist.');
    }

    console.log('--- Current Database Permissions Count ---');
    const count = await prisma.permission.count();
    console.log(`Total Permissions: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
