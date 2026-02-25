import 'dotenv/config';
import { prisma } from '../db';

async function fix() {
    console.log("🌱 Applying Stripe Fix Script...");
    try {
        // 1. Ensure columns exist (Raw SQL)
        console.log("   Checking/Adding columns...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "stripeBasePriceId" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "stripeUserPriceId" TEXT;`);

        // 2. Update existing plans
        console.log("   Updating 'Starter' plan...");
        await prisma.pricingConfig.upsert({
            where: { id: 'Starter' },
            update: {
                stripeBasePriceId: 'price_1T4QyqE9NGotUyVqu2oTicMx',
                stripeUserPriceId: 'price_1T4QyqE9NGotUyVq4GQNKdb6'
            },
            create: {
                id: 'Starter',
                basePrice: 99,
                pricePerUser: 10,
                features: ['5 Users Max', 'Basic Conflict Checking'],
                stripeBasePriceId: 'price_1T4QyqE9NGotUyVqu2oTicMx',
                stripeUserPriceId: 'price_1T4QyqE9NGotUyVq4GQNKdb6'
            }
        });

        console.log("   Updating 'Professional' plan...");
        await prisma.pricingConfig.upsert({
            where: { id: 'Professional' },
            update: {
                stripeBasePriceId: 'price_1T4QyrE9NGotUyVqjYt2IifS',
                stripeUserPriceId: 'price_1T4QysE9NGotUyVqoTcL3Wjo'
            },
            create: {
                id: 'Professional',
                basePrice: 149,
                pricePerUser: 15,
                features: ['50 Users Max', 'Advanced Conflict Workflows'],
                stripeBasePriceId: 'price_1T4QyrE9NGotUyVqjYt2IifS',
                stripeUserPriceId: 'price_1T4QysE9NGotUyVqoTcL3Wjo'
            }
        });

        console.log("✅ Stripe Fix Applied Successfully.");
    } catch (e) {
        console.error("❌ Failed to apply Stripe fix:", e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
