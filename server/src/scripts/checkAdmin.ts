import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- ROLES ---");
        const roles = await prisma.role.findMany();
        roles.forEach(r => console.log(`Role: ${r.name} | isSystem: ${r.isSystem} | tenantId: ${r.tenantId}`));

        console.log("\n--- USERS ---");
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        users.forEach(u => console.log(`User: ${u.email} | Role: ${u.role?.name || u.roleString} | tenantId: ${u.tenantId}`));

        const admin = await prisma.user.findFirst({
            where: {
                role: {
                    name: 'GLOBAL_ADMIN'
                }
            }
        });
        console.log("\nFound Global Admin by relation:", admin ? admin.email : "NONE");

        const adminByString = await prisma.user.findFirst({
            where: {
                roleString: 'GLOBAL_ADMIN'
            }
        });
        console.log("Found Global Admin by roleString:", adminByString ? adminByString.email : "NONE");

    } catch (e: any) {
        console.error("Diagnostic failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
