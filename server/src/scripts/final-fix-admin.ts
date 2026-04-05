import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nomosdesk.com';
    const firebaseUid = 'fb-admin-demo';

    // Find the GLOBAL_ADMIN role
    const globalAdminRole = await prisma.role.findFirst({
        where: { name: 'GLOBAL_ADMIN', isSystem: true, tenantId: null }
    });

    if (!globalAdminRole) {
        console.error("❌ GLOBAL_ADMIN role not found.");
        return;
    }

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            // @ts-ignore
            firebaseUid,
            tenantId: null,
            roleId: globalAdminRole.id,
            roleString: 'GLOBAL_ADMIN'
        },
        create: {
            email,
            // @ts-ignore
            firebaseUid,
            name: 'Global Admin',
            tenantId: null,
            roleId: globalAdminRole.id,
            roleString: 'GLOBAL_ADMIN',
            region: 'GH_ACC_1'
        }
    });

    console.log(`✅ Superadmin user ${user.email} is ready.`);
    console.log(`Firebase UID is set to: ${firebaseUid}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
