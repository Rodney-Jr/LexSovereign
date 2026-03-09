import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createDemoTenant(
    name: string,
    appMode: string,
    users: { email: string; name: string; roleName: string }[],
    password: string
) {
    const region = 'GH_ACC_1';

    console.log(`🏗️  Provisioning Tenant: ${name} (${appMode})...`);

    // 1. Create or Update Tenant
    const tenant = await prisma.tenant.upsert({
        where: { name },
        update: { appMode, plan: 'ENTERPRISE', primaryRegion: region, status: 'ACTIVE' },
        create: {
            id: randomUUID(),
            name,
            plan: 'ENTERPRISE',
            primaryRegion: region,
            appMode,
            status: 'ACTIVE'
        }
    });

    const tenantId = tenant.id;

    // 2. Ensure System Roles exist and are cloned to Tenant
    console.log('   Ensuring System Roles logic...');
    const sysRoles = await prisma.role.findMany({
        where: { tenantId: null, isSystem: true },
        include: { permissions: true }
    });

    for (const sysRole of sysRoles) {
        await prisma.role.upsert({
            where: { tenantId_name: { tenantId, name: sysRole.name } },
            update: {},
            create: {
                id: randomUUID(),
                name: sysRole.name,
                description: sysRole.description,
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: sysRole.permissions.map(p => ({ id: p.id }))
                }
            }
        });
    }

    // 3. Create/Update Users
    console.log('   Provisioning Users...');
    const hashedPass = await bcrypt.hash(password, 10);

    for (const u of users) {
        const role = await prisma.role.findFirst({
            where: { tenantId, name: u.roleName }
        });

        if (!role) {
            console.error(`   ❌ Role ${u.roleName} not found for tenant ${name}`);
            continue;
        }

        const licenseId = `BAR-${Math.floor(Math.random() * 90000) + 10000}`;
        const credentials = [
            { type: 'JURISDICTION_BAR_LICENSE', id: licenseId, region: 'GH_ACC_1' }
        ];

        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                name: u.name,
                passwordHash: hashedPass,
                tenantId: tenantId,
                roleId: role.id,
                roleString: role.name,
                region: region,
                jurisdictionPins: ['GH_ACC_1'],
                credentials: credentials as any,
                isActive: true
            },
            create: {
                id: randomUUID(),
                email: u.email,
                name: u.name,
                passwordHash: hashedPass,
                tenantId: tenantId,
                roleId: role.id,
                roleString: role.name,
                region: region,
                roleSeniority: u.roleName === 'MANAGING_PARTNER' ? 10.0 : 5.0,
                jurisdictionPins: ['GH_ACC_1'],
                credentials: credentials as any,
                isActive: true
            }
        });
        console.log(`   ✅ Provisioned User: ${u.email} (${u.roleName})`);
    }
}

async function main() {
    const COMMON_PASSWORD = 'NomosDemo2026!';

    try {
        // Route 1: Law Firm
        await createDemoTenant(
            'Sovereign Legal Partners',
            'LAW_FIRM',
            [
                { email: 'mpartner@sovlegal.com', name: 'James Mensah (Managing Partner)', roleName: 'MANAGING_PARTNER' },
                { email: 'associate@sovlegal.com', name: 'Kwame Boateng (Associate)', roleName: 'JUNIOR_ASSOCIATE' },
                { email: 'admin@sovlegal.com', name: 'Sarah Okai (Admin Manager)', roleName: 'ADMIN_MANAGER' },
                { email: 'clerk@sovlegal.com', name: 'John Doe (Clerk)', roleName: 'CLERK' }
            ],
            COMMON_PASSWORD
        );

        // Route 2: Enterprise Legal
        await createDemoTenant(
            'Global Tech Legal',
            'LAW_FIRM',
            [
                { email: 'gc@globaltech.com', name: 'Elena Vance (General Counsel)', roleName: 'MANAGING_PARTNER' },
                { email: 'counsel@globaltech.com', name: 'Marcus Cole (Legal Counsel)', roleName: 'JUNIOR_ASSOCIATE' },
                { email: 'ops@globaltech.com', name: 'Legal Ops Manager', roleName: 'ADMIN_MANAGER' },
                { email: 'legalassistant@globaltech.com', name: 'Tech Legal Assistant', roleName: 'CLERK' }
            ],
            COMMON_PASSWORD
        );

        console.log('\n🌟 SALES DEMO PROVISIONING COMPLETE 🌟');
        console.log('-------------------------------------------');
        console.log('PASSWORD: ' + COMMON_PASSWORD);
        console.log('STRIPE TEST CARD: 4242 4242 4242 4242 (12/28, 123)');
        console.log('-------------------------------------------');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

