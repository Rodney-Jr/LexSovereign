import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Managing Partner Demo Data...');

    // 1. Find or Create Demo Tenant
    let tenant = await prisma.tenant.findFirst({
        where: { name: 'Sovereign Chambers demo' }
    });

    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'Sovereign Chambers demo',
                plan: 'ENCLAVE',
                primaryRegion: 'SOV-PR-1',
                status: 'ACTIVE'
            }
        });
    }

    // 2. Get the MANAGING_PARTNER Role
    const mpRole = await prisma.role.findFirst({
        where: { name: 'MANAGING_PARTNER', isSystem: true, tenantId: null }
    });

    if (!mpRole) {
        throw new Error('MANAGING_PARTNER role not found. Please run seed.ts first.');
    }

    // 3. Create Managing Partner User
    const mpUser = await prisma.user.upsert({
        where: { email: 'managing_partner@nomosdesk.com' },
        update: {
            roleId: mpRole.id,
            tenantId: tenant.id
        },
        create: {
            email: 'managing_partner@nomosdesk.com',
            name: 'Kofi Mensah (MP)',
            // @ts-ignore
            firebaseUid: 'fb-mp-demo',
            roleId: mpRole.id,
            tenantId: tenant.id,
            isActive: true
        }
    });

    console.log(`✅ Managing Partner created: ${mpUser.email}`);

    // 4. Create a technical Tenant Admin for comparison
    const taRole = await prisma.role.findFirst({
        where: { name: 'TENANT_ADMIN', isSystem: true, tenantId: null }
    });

    if (taRole) {
        const taUser = await prisma.user.upsert({
            where: { email: 'tech_admin@nomosdesk.com' },
            update: {
                roleId: taRole.id,
                tenantId: tenant.id
            },
            create: {
                email: 'tech_admin@nomosdesk.com',
                name: 'Tech Admin (IT)',
                // @ts-ignore
                firebaseUid: 'fb-ta-demo',
                roleId: taRole.id,
                tenantId: tenant.id,
                isActive: true
            }
        });
        console.log(`✅ Tech Admin created: ${taUser.email}`);
    }

    // 5. Create Associate 1
    const associateRole = await prisma.role.findFirst({
        where: { name: 'JUNIOR_ASSOCIATE', isSystem: true, tenantId: null }
    });

    if (associateRole) {
        const assocUser = await prisma.user.upsert({
            where: { email: 'associate1@nomosdesk.com' },
            update: {
                roleId: associateRole.id,
                tenantId: tenant.id
            },
            create: {
                email: 'associate1@nomosdesk.com',
                name: 'Akwasi Mensah (Associate)',
                // @ts-ignore
                firebaseUid: 'fb-associate1-demo',
                roleId: associateRole.id,
                tenantId: tenant.id,
                isActive: true
            }
        });
        console.log(`✅ Associate 1 created: ${assocUser.email}`);
    }

    // 6. Create Admin Manager
    const amRole = await prisma.role.findFirst({
        where: { name: 'ADMIN_MANAGER', isSystem: true, tenantId: null }
    });

    if (amRole) {
        const amUser = await prisma.user.upsert({
            where: { email: 'admin_manager@nomosdesk.com' },
            update: {
                roleId: amRole.id,
                tenantId: tenant.id
            },
            create: {
                email: 'admin_manager@nomosdesk.com',
                name: 'Kofi Mensah (AM)',
                // @ts-ignore
                firebaseUid: 'fb-am-demo',
                roleId: amRole.id,
                tenantId: tenant.id,
                isActive: true
            }
        });
        console.log(`✅ Admin Manager created: ${amUser.email}`);
    }

    console.log('🚀 Managing Partner seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
