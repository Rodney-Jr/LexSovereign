import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.role.findMany({
        include: {
            permissions: true
        }
    });

    console.log('System Roles and Permissions:');
    for (const role of roles) {
        console.log(`\nRole: ${role.name} (${role.id})`);
        console.log('Permissions:');
        role.permissions.forEach(p => console.log(`- ${p.id}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
