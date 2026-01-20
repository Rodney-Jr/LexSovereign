import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
    // Platform
    { id: 'manage_platform', description: 'Full platform control', resource: 'PLATFORM', action: 'MANAGE' },
    { id: 'create_tenant', description: 'Create new tenants', resource: 'TENANT', action: 'CREATE' },
    { id: 'configure_bridge', description: 'Configure integration bridges', resource: 'BRIDGE', action: 'CONFIGURE' },
    { id: 'read_all_audits', description: 'Read system-wide audit logs', resource: 'AUDIT', action: 'READ_ALL' },

    // Leadership
    { id: 'manage_tenant', description: 'Manage tenant settings', resource: 'TENANT', action: 'MANAGE' },
    { id: 'manage_users', description: 'Manage users and roles', resource: 'USER', action: 'MANAGE' },
    { id: 'manage_roles', description: 'Create and edit custom roles', resource: 'ROLE', action: 'MANAGE' },
    { id: 'approve_matter_high_risk', description: 'Approve high risk matters', resource: 'MATTER', action: 'APPROVE_HIGH_RISK' },
    { id: 'approve_spend', description: 'Approve external spend', resource: 'FINANCE', action: 'APPROVE' },

    // Practice
    { id: 'sign_document', description: 'Sign legal documents', resource: 'DOCUMENT', action: 'SIGN' },
    { id: 'close_matter', description: 'Close/Archive matters', resource: 'MATTER', action: 'CLOSE' },
    { id: 'create_matter', description: 'Create new matters', resource: 'MATTER', action: 'CREATE' },
    { id: 'edit_document', description: 'Edit document content', resource: 'DOCUMENT', action: 'EDIT' },
    { id: 'override_ai', description: 'Override AI safety checks', resource: 'AI', action: 'OVERRIDE' },
    { id: 'draft_document', description: 'Draft documents', resource: 'DOCUMENT', action: 'DRAFT' },

    // Ops & Compliance
    { id: 'design_workflow', description: 'Design workflows', resource: 'WORKFLOW', action: 'DESIGN' },
    { id: 'upload_document', description: 'Upload documents', resource: 'DOCUMENT', action: 'UPLOAD' },
    { id: 'read_billing', description: 'View billing dashboards', resource: 'BILLING', action: 'READ' },
    { id: 'configure_rre', description: 'Configure Regulatory Rules Engine', resource: 'RRE', action: 'CONFIGURE' },
    { id: 'configure_scrub', description: 'Configure PII scrubbing', resource: 'SCRUB', action: 'CONFIGURE' },
];

const ROLES = [
    { name: 'GLOBAL_ADMIN', permissions: ['manage_platform', 'create_tenant', 'configure_bridge', 'read_all_audits'] },
    { name: 'TENANT_ADMIN', permissions: ['manage_tenant', 'manage_users', 'manage_roles', 'approve_spend', 'create_matter'] },
    { name: 'PARTNER', permissions: ['sign_document', 'close_matter', 'create_matter', 'edit_document', 'override_ai', 'approve_spend'] },
    { name: 'SENIOR_COUNSEL', permissions: ['create_matter', 'edit_document', 'override_ai', 'draft_document'] },
    { name: 'JUNIOR_ASSOCIATE', permissions: ['draft_document', 'upload_document'] },
    { name: 'LEGAL_OPS_MANAGER', permissions: ['design_workflow', 'manage_users'] },
    { name: 'COMPLIANCE_OFFICER', permissions: ['configure_rre', 'read_all_audits'] },
    { name: 'EXTERNAL_COUNSEL', permissions: ['upload_document', 'draft_document'] } // Reduced scope
];

async function main() {
    console.log('🌱 Seeding Permissions...');
    for (const p of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { id: p.id },
            update: {},
            create: p
        });
    }

    console.log('🌱 Seeding System Roles...');
    for (const r of ROLES) {
        // Create role if not exists
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: {}, // Don't overwrite existing perms to avoid resetting custom changes if we run seed again? 
            // Actually for system roles strict sync might be better. Let's strict sync for now.
            create: {
                name: r.name,
                description: `System Role: ${r.name}`,
                isSystem: true,
                permissions: {
                    connect: r.permissions.map(id => ({ id }))
                }
            }
        });
    }

    // Tenant
    const tenant = await prisma.tenant.create({
        data: { name: 'LexSovereign Demo', plan: 'ENTERPRISE', primaryRegion: 'GH_ACC_1' }
    });

    const passwordHash = await bcrypt.hash('password123', 10);

    // Fetch generic IDs for roles
    const globalAdminRole = await prisma.role.findUnique({ where: { name: 'GLOBAL_ADMIN' } });
    const seniorCounselRole = await prisma.role.findUnique({ where: { name: 'SENIOR_COUNSEL' } });

    // Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@lexsovereign.com',
            passwordHash,
            name: 'Sovereign Admin',
            roleId: globalAdminRole?.id,
            roleString: 'GLOBAL_ADMIN', // Keep legacy for middleware compat until migrated
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    const counsel = await prisma.user.create({
        data: {
            email: 'counsel@lexsovereign.com',
            passwordHash,
            name: 'Internal Counsel',
            roleId: seniorCounselRole?.id,
            roleString: 'INTERNAL_COUNSEL',
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    console.log(`✅ Seeded Users: ${admin.email}, ${counsel.email}`);

    // Matters
    const matter1 = await prisma.matter.create({
        data: {
            id: 'MT-772', name: 'Acme Corp Merger', client: 'Acme Corp', type: 'M&A', status: 'OPEN', riskLevel: 'HIGH',
            tenantId: tenant.id, internalCounselId: counsel.id
        }
    });

    console.log('✅ Seeded Matter 1');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
