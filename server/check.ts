import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const adminPerms = [
    'MANAGE_TENANT_SETTINGS', 'MANAGE_USER', 'MANAGE_ROLE',
    'VIEW_BILLING_TENANT', 'VIEW_STATS_TENANT', 'CREATE:MATTER',
    'VIEW:CLIENT', 'CREATE:CLIENT', 'UPLOAD:DOCUMENT',
    'CREATE:DRAFT', 'EDIT:DRAFT', 'USE:CHAT',
    'EXECUTE:AI', 'ACCESS:HR', 'ACCESS:ACCOUNTING'
];

const userPerms = [
    'CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS',
    'CREATE:DRAFT', 'EDIT:DRAFT', 'VIEW:CLIENT'
];

async function check() {
    const allPerms = await prisma.permission.findMany();
    const dbIds = new Set(allPerms.map(p => p.id));
    
    console.log("Admin Missing:", adminPerms.filter(p => !dbIds.has(p)));
    console.log("User Missing:", userPerms.filter(p => !dbIds.has(p)));
}

check().finally(() => prisma.$disconnect());
