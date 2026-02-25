/**
 * repairStripeIds.ts
 * Emergency repair: Update PricingConfig records with live Stripe Price IDs.
 * Runs with the native pg client (no Prisma engine needed).
 */
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function repair() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('✅ Connected to database.');

        const updates = [
            {
                id: 'Starter',
                stripeBasePriceId: 'price_1T4QyqE9NGotUyVqu2oTicMx',
                stripeUserPriceId: 'price_1T4QyqE9NGotUyVq4GQNKdb6'
            },
            {
                id: 'Professional',
                stripeBasePriceId: 'price_1T4QyrE9NGotUyVqjYt2IifS',
                stripeUserPriceId: 'price_1T4QysE9NGotUyVqoTcL3Wjo'
            }
        ];

        for (const plan of updates) {
            const result = await client.query(
                `UPDATE "PricingConfig" SET "stripeBasePriceId" = $1, "stripeUserPriceId" = $2 WHERE id = $3`,
                [plan.stripeBasePriceId, plan.stripeUserPriceId, plan.id]
            );
            console.log(`✅ ${plan.id}: updated ${result.rowCount} row(s).`);
        }

        // Verify
        const rows = await client.query(`SELECT id, "stripeBasePriceId", "stripeUserPriceId" FROM "PricingConfig"`);
        console.log('\n📋 Current PricingConfig state:');
        for (const row of rows.rows) {
            console.log(`  ${row.id}: base=${row.stripeBasePriceId}, user=${row.stripeUserPriceId}`);
        }
    } catch (err: any) {
        console.error('❌ Repair failed:', err.message);
    } finally {
        await client.end();
    }
}

repair();
