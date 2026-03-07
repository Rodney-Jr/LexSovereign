
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

async function createPrices() {
    console.log('--- CREATING NEW STRIPE PRICES ---');

    try {
        // 1. Solo Plan
        const soloProduct = await stripe.products.create({ name: 'NomosDesk Solo' });
        const soloBase = await stripe.prices.create({
            product: soloProduct.id,
            unit_amount: 1900,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Solo Base'
        });
        const soloUser = await stripe.prices.create({
            product: soloProduct.id,
            unit_amount: 500,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Solo Per User'
        });

        // 2. Professional Plan
        const proProduct = await stripe.products.create({ name: 'NomosDesk Professional' });
        const proBase = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 7900,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Professional Base'
        });
        const proUser = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 1000,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Professional Per User'
        });

        // 3. Institutional Plan
        const instProduct = await stripe.products.create({ name: 'NomosDesk Institutional' });
        const instBase = await stripe.prices.create({
            product: instProduct.id,
            unit_amount: 29900,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Institutional Base'
        });
        // Marketing says $0/user for Institutional currently? (based on pricePerUser: 0 in PricingPage.tsx)
        // Actually, seed says $25. I'll create a $0 one if needed, or just skip user price for now as per marketing UI.
        // I'll create a $25 one just in case we need it for the backend logic.
        const instUser = await stripe.prices.create({
            product: instProduct.id,
            unit_amount: 2500,
            currency: 'usd',
            recurring: { interval: 'month' },
            nickname: 'Institutional Per User'
        });

        console.log('--- NEW PRICE IDs ---');
        console.log(`Solo Product: ${soloProduct.id}`);
        console.log(`  Base: ${soloBase.id} ($19)`);
        console.log(`  User: ${soloUser.id} ($5)`);
        console.log(`Professional Product: ${proProduct.id}`);
        console.log(`  Base: ${proBase.id} ($79)`);
        console.log(`  User: ${proUser.id} ($10)`);
        console.log(`Institutional Product: ${instProduct.id}`);
        console.log(`  Base: ${instBase.id} ($299)`);
        console.log(`  User: ${instUser.id} ($25)`);

    } catch (err: any) {
        console.error(`ERROR: ${err.message}`);
    }
}

createPrices();
