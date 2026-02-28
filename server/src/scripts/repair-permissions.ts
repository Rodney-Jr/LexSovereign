
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REQUIRED_PERMISSIONS = [
    { id: 'manage_tenant', description: 'Manage tenant settings', resource: 'TENANT', action: 'MANAGE' },
    { id: 'manage_users', description: 'Manage users and roles', resource: 'USER', action: 'MANAGE' },
    { id: 'manage_roles', description: 'Create and edit custom roles', resource: 'ROLE', action: 'MANAGE' },
    { id: 'read_billing', description: 'View billing dashboards', resource: 'BILLING', action: 'READ' },
    { id: 'read_all_audits', description: 'Read system-wide audit logs', resource: 'AUDIT', action: 'READ_ALL' },
    { id: 'create_matter', description: 'Create new matters', resource: 'MATTER', action: 'CREATE' }
];

async function repair() {
    console.log('STARTING PERMISSION REPAIR...');

    for (const p of REQUIRED_PERMISSIONS) {
        const existing = await prisma.permission.findUnique({ where: { id: p.id } });
        if (!existing) {
            console.log(`[REPAIR] Creating missing permission: ${p.id}`);
            await prisma.permission.create({ data: p });
        } else {
            console.log(`[CHECK] Permission exists: ${p.id}`);
        }
    }

    console.log('REPAIR COMPLETE.');
}

repair()
    .catch(err => {
        console.error('REPAIR FAILED:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
