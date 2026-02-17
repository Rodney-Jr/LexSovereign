
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nomosdesk.com';
    const newPassword = 'password123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

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
            passwordHash,
            tenantId: null,
            roleId: globalAdminRole.id,
            roleString: 'GLOBAL_ADMIN'
        },
        create: {
            email,
            passwordHash,
            name: 'Global Admin',
            tenantId: null,
            roleId: globalAdminRole.id,
            roleString: 'GLOBAL_ADMIN',
            region: 'GH_ACC_1'
        }
    });

    console.log(`✅ Superadmin user ${user.email} is ready.`);
    console.log(`Password is set to: ${newPassword}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
