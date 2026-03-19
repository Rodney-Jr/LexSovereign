import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STANDARD_PERMISSIONS = [
    // Tenant Settings
    { id: 'VIEW_TENANT_SETTINGS', resource: 'TENANT_SETTINGS', action: 'VIEW', description: 'Can view tenant settings.' },
    { id: 'MANAGE_TENANT_SETTINGS', resource: 'TENANT_SETTINGS', action: 'MANAGE', description: 'Can manage tenant settings.' },
    
    // Roles & Users
    { id: 'MANAGE_ROLE', resource: 'ROLE', action: 'MANAGE', description: 'Can create and modify custom roles.' },
    { id: 'MANAGE_USER', resource: 'USER', action: 'MANAGE', description: 'Can manage internal users.' },
    
    // Tenant Stats/Billing/UI
    { id: 'VIEW_STATS_TENANT', resource: 'TENANT', action: 'VIEW_STATS', description: 'Can view tenant capacity and admin stats.' },
    { id: 'VIEW_BILLING_TENANT', resource: 'TENANT', action: 'VIEW_BILLING', description: 'Can view tenant billing stats.' },
    { id: 'MANAGE_UI_TENANT', resource: 'TENANT', action: 'MANAGE_UI', description: 'Can manage UI visibility for roles.' },
    
    // Matters & Legal Operations
    { id: 'VIEW_MATTER', resource: 'MATTER', action: 'VIEW', description: 'Can view assigned matters.' },
    { id: 'CREATE_MATTER', resource: 'MATTER', action: 'CREATE', description: 'Can incept new matters.' },
    { id: 'CHECK:CONFLICTS', resource: 'CONFLICTS', action: 'CHECK', description: 'Can perform ZK conflict checks.' },
    { id: 'REVIEW:WORK', resource: 'WORK', action: 'REVIEW', description: 'Can perform lead counsel review.' },
    { id: 'MANAGE:WORKFLOW', resource: 'WORKFLOW', action: 'MANAGE', description: 'Can design and manage workflows.' },
    
    // Documents & Drafting
    { id: 'UPLOAD:DOCUMENT', resource: 'DOCUMENT', action: 'UPLOAD', description: 'Can upload documents to the vault.' },
    { id: 'CREATE:DRAFT', resource: 'DRAFT', action: 'CREATE', description: 'Can create drafts in the studio.' },
    { id: 'EDIT:DRAFT', resource: 'DRAFT', action: 'EDIT', description: 'Can edit existing drafts.' },
    { id: 'SUBMIT:REVIEW', resource: 'REVIEW', action: 'SUBMIT', description: 'Can submit work for review.' },
    { id: 'APPROVE:DOCUMENT', resource: 'DOCUMENT', action: 'APPROVE', description: 'Can approve legal documents.' },
    { id: 'EXPORT_DOCUMENT', resource: 'DOCUMENT', action: 'EXPORT', description: 'Can export documents on final review.' },
    
    // AI & Intelligence
    { id: 'EXECUTE:AI', resource: 'AI', action: 'EXECUTE', description: 'Can execute AI-driven intelligence tasks.' },
    { id: 'USE:CHAT', resource: 'CHAT', action: 'USE', description: 'Can use the Sovereign legal chat.' },
    { id: 'VIEW:CONFIDENTIAL', resource: 'DOCUMENT', action: 'VIEW_CONFIDENTIAL', description: 'Can view restricted/confidential docs.' },
    
    // Finance & HR
    { id: 'ACCESS:ACCOUNTING', resource: 'ACCOUNTING', action: 'ACCESS', description: 'Can access the accounting hub.' },
    { id: 'MANAGE:EXPENSES', resource: 'EXPENSES', action: 'MANAGE', description: 'Can manage and approve expenses.' },
    { id: 'MANAGE:BUDGET', resource: 'BUDGET', action: 'MANAGE', description: 'Can manage matter budgets.' },
    { id: 'ACCESS:HR', resource: 'HR', action: 'ACCESS', description: 'Can access the HR workbench.' },
    
    // Clients
    { id: 'VIEW_CLIENTS', resource: 'CLIENT', action: 'VIEW', description: 'Can view clients.' },
    { id: 'CREATE_CLIENT', resource: 'CLIENT', action: 'CREATE', description: 'Can create clients.' },
    
    // System & Portal
    { id: 'ACCESS:CLIENT_PORTAL', resource: 'CLIENT_PORTAL', action: 'ACCESS', description: 'Can access the client portal.' },
    { id: 'ACCESS:INFRASTRUCTURE', resource: 'INFRASTRUCTURE', action: 'ACCESS', description: 'Can view infrastructure plane.' },
    { id: 'ACCESS:ROADMAP', resource: 'ROADMAP', action: 'ACCESS', description: 'Can view platform roadmap.' },
    { id: 'VIEW:TRIAL', resource: 'TRIAL', action: 'VIEW', description: 'Can view platform trial status.' },
    { id: 'MANAGE:PLATFORM', resource: 'PLATFORM', action: 'MANAGE', description: 'Global platform operations.' }
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
                        { id: 'EXPORT_DOCUMENT' },
                        { id: 'VIEW_MATTER' },
                        { id: 'CREATE:DRAFT' },
                        { id: 'EDIT:DRAFT' },
                        { id: 'UPLOAD:DOCUMENT' },
                        { id: 'USE:CHAT' },
                        { id: 'EXECUTE:AI' }
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
