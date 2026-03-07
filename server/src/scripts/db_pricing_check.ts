
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDb() {
    console.log('--- DATABASE PRICING CHECK ---');
    const configs = await prisma.pricingConfig.findMany();
    console.log(JSON.stringify(configs, null, 2));
    await prisma.$disconnect();
}

checkDb();
