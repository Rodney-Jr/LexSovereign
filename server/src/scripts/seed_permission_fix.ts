import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_PERMISSIONS = [
    {
        id: 'VIEW_TENANT_SETTINGS',
        resource: 'TENANT',
        action: 'VIEW_SETTINGS',
        description: 'Allows viewing of organization-level settings and residency profiles.'
    },
    {
        id: 'MANAGE_SETTINGS',
        resource: 'TENANT',
        action: 'MANAGE_SETTINGS',
        description: 'Allows updating organization-level settings and residency profiles.'
    }
];

async function main() {
    console.log('--- Seeding Granular Tenant Permissions ---');

    for (const perm of NEW_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { id: perm.id },
            update: {
                resource: perm.resource,
                action: perm.action,
                description: perm.description
            },
            create: perm
        });
        console.log(`Upserted permission: ${perm.id}`);
    }

    // Assign to GLOBAL_ADMIN and TENANT_ADMIN roles
    const rolesToUpdate = ['GLOBAL_ADMIN', 'TENANT_ADMIN'];
    
    const roles = await prisma.role.findMany({
        where: {
            name: { in: rolesToUpdate }
        }
    });

    console.log(`Found ${roles.length} roles to update.`);

    for (const role of roles) {
        await prisma.role.update({
            where: { id: role.id },
            data: {
                permissions: {
                    connect: NEW_PERMISSIONS.map(p => ({ id: p.id }))
                }
            }
        });
        console.log(`Updated role: ${role.name} (Tenant: ${role.tenantId || 'System'})`);
    }

    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
