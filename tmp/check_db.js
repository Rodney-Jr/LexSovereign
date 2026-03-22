import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.documentTemplate.count();
        console.log(`Total Templates: ${count}`);
        
        const mattterCount = await prisma.matter.count();
        console.log(`Total Matters: ${mattterCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
