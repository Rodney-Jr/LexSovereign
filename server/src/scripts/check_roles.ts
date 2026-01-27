
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking roles in database...");
    const roles = await prisma.role.findMany();
    console.log(`Found ${roles.length} roles:`);
    roles.forEach(r => {
        console.log(`- ${r.name} (isSystem: ${r.isSystem}, tenantId: ${r.tenantId})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
