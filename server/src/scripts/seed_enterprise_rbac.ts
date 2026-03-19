import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STANDARD_PERMISSIONS = [
    // Tenant Settings
    { id: 'VIEW_TENANT_SETTINGS', resource: 'TENANT_SETTINGS', action: 'VIEW', description: 'Can view tenant settings.' },
    { id: 'MANAGE_TENANT_SETTINGS', resource: 'TENANT_SETTINGS', action: 'MANAGE', description: 'Can manage tenant settings.' },
    
    // Roles
    { id: 'MANAGE_ROLE', resource: 'ROLE', action: 'MANAGE', description: 'Can create and modify custom roles.' },
    
    // Users
    { id: 'MANAGE_USER', resource: 'USER', action: 'MANAGE', description: 'Can manage internal users.' },
    
    // Tenant Stats/Billing
    { id: 'VIEW_STATS_TENANT', resource: 'TENANT', action: 'VIEW_STATS', description: 'Can view tenant capacity and admin stats.' },
    { id: 'VIEW_BILLING_TENANT', resource: 'TENANT', action: 'VIEW_BILLING', description: 'Can view tenant billing stats.' },
    { id: 'MANAGE_UI_TENANT', resource: 'TENANT', action: 'MANAGE_UI', description: 'Can manage UI visibility for roles.' },
    
    // Exports
    { id: 'EXPORT_DOCUMENT', resource: 'DOCUMENT', action: 'EXPORT', description: 'Can export documents on final review.' },
    
    // Clients
    { id: 'VIEW_CLIENTS', resource: 'CLIENT', action: 'VIEW', description: 'Can view clients.' },
    { id: 'CREATE_CLIENT', resource: 'CLIENT', action: 'CREATE', description: 'Can create clients.' }
];

async function main() {
    console.log('=== SEEDING ENTERPRISE RBAC ===');

    for (const perm of STANDARD_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { id: perm.id },
            update: {
                resource: perm.resource,
                action: perm.action,
                description: perm.description
            },
            create: perm
        });
        console.log(`Upserted permission: ${perm.action} on ${perm.resource}`);
    }

    // Assign to TENANT_ADMIN (Tenant-scoped)
    const tenantAdmins = await prisma.role.findMany({ where: { name: 'TENANT_ADMIN' } });
    for (const role of tenantAdmins) {
        await prisma.role.update({
            where: { id: role.id },
            data: {
                permissions: {
                    connect: STANDARD_PERMISSIONS.map(p => ({ id: p.id }))
                }
            }
        });
        console.log(`Updated TENANT_ADMIN role permissions for tenant: ${role.tenantId || 'Global'}`);
    }

    // Assign basic permissions to INTERNAL_COUNSEL
    const internalCounselRoles = await prisma.role.findMany({ where: { name: 'INTERNAL_COUNSEL' } });
    for (const role of internalCounselRoles) {
        await prisma.role.update({
            where: { id: role.id },
            data: {
                permissions: {
                    connect: [
                        { id: 'VIEW_TENANT_SETTINGS' },
                        { id: 'VIEW_CLIENTS' },
                        { id: 'CREATE_CLIENT' },
                        { id: 'EXPORT_DOCUMENT' }
                    ]
                }
            }
        });
        console.log(`Updated INTERNAL_COUNSEL role permissions for tenant: ${role.tenantId || 'Global'}`);
    }
    
    // Assign to GLOBAL_ADMIN explicitly (though they have a role bypass in middleware, it helps frontend checks)
    const globalAdmins = await prisma.role.findMany({ where: { name: 'GLOBAL_ADMIN' } });
    for (const role of globalAdmins) {
        await prisma.role.update({
            where: { id: role.id },
            data: {
                permissions: {
                    connect: STANDARD_PERMISSIONS.map(p => ({ id: p.id }))
                }
            }
        });
        console.log(`Updated GLOBAL_ADMIN role permissions for tenant: ${role.tenantId || 'Global'}`);
    }

    console.log('=== ENTERPRISE RBAC SEEDING COMPLETE ===');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
