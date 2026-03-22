import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const tenantCount = await prisma.tenant.count();
        console.log(`\nTotal Tenants: ${tenantCount}`);
        const tenants = await prisma.tenant.findMany({ select: { id: true, name: true, plan: true }});
        console.log('Tenants:');
        console.dir(tenants, { depth: null });

        const userCount = await prisma.user.count();
        console.log(`\nTotal Users: ${userCount}`);
        const users = await prisma.user.findMany({ 
            select: { id: true, email: true, name: true, roleString: true, tenantId: true },
            take: 20
        });
        console.log('Sample Users (Top 20):');
        console.dir(users, { depth: null });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
