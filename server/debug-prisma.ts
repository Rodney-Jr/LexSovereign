import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Keys in prisma client:', Object.keys(prisma));
    console.log('prisma.permission:', prisma.permission);
    console.log('prisma.role:', prisma.role);
    console.log('prisma.user:', prisma.user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
