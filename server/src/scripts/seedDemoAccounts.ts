import { prisma } from '../db';

/**
 * SEED DEMO ACCOUNTS SCRIPT
 *
 * Adds a TENANT_ADMIN and a CLIENT account to each primary demo tenant.
 * Idempotent: uses upsert/findFirst to avoid duplicates.
 */

const DEMO_PASSWORD = 'Demo@2024!';

interface DemoTenantConfig {
    id: string;
    name: string;
    adminEmail: string;
    adminName: string;
    clientEmail: string;
    clientName: string;
}

const DEMO_TENANTS: DemoTenantConfig[] = [
    {
        id: 'demo-tenant-lawfirm',
        name: 'Apex Law Partners',
        adminEmail: 'admin@apexlaw.demo',
        adminName: 'Apex Admin',
        clientEmail: 'client@apexlaw.demo',
        clientName: 'Corporate Client (Apex)',
    },
    {
        id: 'demo-tenant-enterprise',
        name: 'Global Logistics Corp',
        adminEmail: 'admin@globallogistics.demo',
        adminName: 'GLC Admin',
        clientEmail: 'client@globallogistics.demo',
        clientName: 'Corporate Client (GLC)',
    },
];

async function findOrCreateRole(
    roleName: string,
    description: string,
    tenantId: string,
    permissionIds: string[]
) {
    const existing = await prisma.role.findFirst({
        where: { name: roleName, tenantId },
    });
    if (existing) return existing;

    const validPerms = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { id: true },
    });

    return await prisma.role.create({
        data: {
            name: roleName,
            description,
            isSystem: true,
            tenantId,
            permissions: { connect: validPerms.map((p) => ({ id: p.id })) },
        },
    });
}

async function seedTenant(config: DemoTenantConfig) {
    console.log(`\n📦 Processing: ${config.name} (${config.id})`);

    const tenant = await prisma.tenant.findUnique({ where: { id: config.id } });
    if (!tenant) {
        console.warn(`  [!] Tenant ${config.id} not found. Skipping.`);
        return;
    }

    // --- Roles ---
    const tenantAdminRole = await findOrCreateRole(
        'TENANT_ADMIN',
        'Firm Administrator',
        config.id,
        [
            'manage_tenant', 'read_all_audits', 'manage_users', 'manage_roles',
            'configure_bridge', 'design_workflow', 'create_draft', 'upload_document',
            'access_hr_workbench', 'access_accounting_hub', 'access_platform_roadmap',
            'access_infrastructure_plane', 'view_trial_status',
        ]
    );
    console.log(`  [✓] TENANT_ADMIN role ready.`);

    const clientRole = await findOrCreateRole(
        'CLIENT',
        'External Client Access',
        config.id,
        ['read_assigned_matter', 'client_portal_access']
    );
    console.log(`  [✓] CLIENT role ready.`);

    // --- TENANT_ADMIN User ---
    const existingAdmin = await prisma.user.findFirst({ where: { email: config.adminEmail } });
    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                email: config.adminEmail,
                name: config.adminName,
                tenantId: config.id,
                roleId: tenantAdminRole.id,
                roleString: 'TENANT_ADMIN',
                region: tenant.primaryRegion,
                roleSeniority: 8.0,
            },
        });
        console.log(`  [+] Created TENANT_ADMIN: ${config.adminEmail}`);
    } else {
        console.log(`  [~] TENANT_ADMIN already exists: ${config.adminEmail}`);
    }

    // --- CLIENT User ---
    const existingClient = await prisma.user.findFirst({ where: { email: config.clientEmail } });
    if (!existingClient) {
        await prisma.user.create({
            data: {
                email: config.clientEmail,
                name: config.clientName,
                tenantId: config.id,
                roleId: clientRole.id,
                roleString: 'CLIENT',
                region: tenant.primaryRegion,
            },
        });
        console.log(`  [+] Created CLIENT: ${config.clientEmail}`);
    } else {
        console.log(`  [~] CLIENT already exists: ${config.clientEmail}`);
    }
}

async function main() {
    console.log('🌱 Seeding Demo Tenant Admin & Client Accounts...');
    console.log('='.repeat(50));

    for (const tenantConfig of DEMO_TENANTS) {
        await seedTenant(tenantConfig);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seeding Complete!\n');
    console.log('📋 Demo Login Credentials:');
    console.log('='.repeat(50));
    for (const t of DEMO_TENANTS) {
        console.log(`\n  [${t.name}]`);
        console.log(`    Admin  : ${t.adminEmail}`);
        console.log(`    Client : ${t.clientEmail}`);
        console.log(`    Pass   : ${DEMO_PASSWORD}`);
    }
    console.log('\n' + '='.repeat(50));
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
