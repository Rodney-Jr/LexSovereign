
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nomosdesk.com';

    // Find the GLOBAL_ADMIN role
    const globalAdminRole = await prisma.role.findFirst({
        where: { name: 'GLOBAL_ADMIN', isSystem: true, tenantId: null }
    });

    if (!globalAdminRole) {
        console.error("❌ GLOBAL_ADMIN role not found.");
        return;
    }

    const user = await prisma.user.update({
        where: { email },
        data: {
            tenantId: null,
            roleId: globalAdminRole.id,
            roleString: 'GLOBAL_ADMIN'
        }
    });

    console.log(`✅ User ${user.email} is now a TRUE Global Admin (tenantId: null).`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
