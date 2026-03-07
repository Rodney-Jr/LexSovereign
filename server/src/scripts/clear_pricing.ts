
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearPricing() {
    console.log('--- CLEARING PRICING CONFIG ---');
    await prisma.pricingConfig.deleteMany();
    console.log('✅ PricingConfig table cleared.');
    await prisma.$disconnect();
}

clearPricing();
