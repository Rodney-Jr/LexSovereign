import { prisma } from '../server/src/db';

async function inspectPermissions() {
    try {
        const roles = await prisma.role.findMany({
            include: { permissions: true }
        });

        console.log("--- Role Permissions Report ---");
        for (const role of roles) {
            console.log(`Role: ${role.name} (${role.id})`);
            console.log(`Permissions: ${role.permissions.map(p => p.id).join(', ')}`);
            console.log("----------------------------");
        }

    } catch (e: any) {
        console.error("Inspection Failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectPermissions();
