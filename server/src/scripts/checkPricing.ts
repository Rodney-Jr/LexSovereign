
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPricing() {
    try {
        const configs = await prisma.pricingConfig.findMany();
        console.log(JSON.stringify(configs, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPricing();
