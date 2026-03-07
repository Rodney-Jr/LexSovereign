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
    const tenantId = randomUUID();
    const region = 'GH_ACC_1';

    console.log(`🏗️  Provisioning Tenant: ${name} (${appMode})...`);

    // 1. Create Tenant
    console.log('   Creating Tenant record...');
    await prisma.tenant.create({
        data: {
            id: tenantId,
            name,
            plan: 'ENTERPRISE',
            primaryRegion: region,
            appMode
        }
    });

    // 2. Clone System Roles to Tenant
    console.log('   Cloning System Roles...');
    const rawSystemRoles = await prisma.role.findMany({
        where: { tenantId: null, isSystem: true },
        include: { permissions: true }
    });

    // Uniqueify by name to avoid P2002 errors if duplicates exist in source
    const systemRoles = Array.from(new Map(rawSystemRoles.map(role => [role.name, role])).values());

    for (const sysRole of systemRoles) {
        console.log(`      Found system role: ${sysRole.name}. Cloning...`);
        try {
            await prisma.role.create({
                data: {
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
        } catch (e: any) {
            console.error(`      ❌ Failed to clone role ${sysRole.name}:`, e.message);
            throw e;
        }
    }

    // 3. Create Users
    console.log('   Creating Users...');
    const hashedPass = await bcrypt.hash(password, 10);

    for (const u of users) {
        const role = await prisma.role.findFirst({
            where: { tenantId: tenantId, name: u.roleName }
        });

        if (!role) {
            console.error(`   ❌ Role ${u.roleName} not found for tenant ${name}`);
            continue;
        }

        await prisma.user.create({
            data: {
                id: randomUUID(),
                email: u.email,
                name: u.name,
                passwordHash: hashedPass,
                tenantId: tenantId,
                roleId: role.id,
                roleString: role.name,
                region: region,
                roleSeniority: u.roleName === 'MANAGING_PARTNER' ? 10.0 : 5.0
            }
        });
        console.log(`   ✅ Created User: ${u.email} (${u.roleName})`);
    }
}

async function main() {
    const COMMON_PASSWORD = 'NomosDemo2026!';

    // Check if the first demo user exists to avoid duplicates
    const check = await prisma.user.findFirst({ where: { email: 'mpartner@sovlegal.com' } });
    if (check) {
        console.log('ℹ️  Demo accounts already exist. Skipping.');
        return;
    }

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
            'LAW_FIRM', // Using standard mode, but named for Enterprise
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
