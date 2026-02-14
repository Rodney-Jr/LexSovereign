
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@lexsovereign.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                include: {
                    permissions: true
                }
            },
            tenant: true
        }
    });

    if (!user) {
        console.log(`❌ User ${email} not found.`);
    } else {
        console.log(`✅ User found: ${user.email}`);
        console.log(`Role: ${user.role?.name}`);
        console.log(`Role (string): ${user.roleString}`);
        console.log(`Tenant: ${user.tenant?.name} (${user.tenantId})`);
        console.log(`Permissions: ${user.role?.permissions.map(p => p.id).join(', ')}`);
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
