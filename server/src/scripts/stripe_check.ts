
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

async function checkPrices() {
    console.log('--- STRIPE PRICE CHECK ---');
    const priceIds = [
        'price_1T4QyqE9NGotUyVqu2oTicMx', // Starter Base
        'price_1T4QyqE9NGotUyVq4GQNKdb6', // Starter User
        'price_1T4QyrE9NGotUyVqjYt2IifS', // Professional Base
        'price_1T4QysE9NGotUyVqoTcL3Wjo'  // Professional User
    ];

    for (const id of priceIds) {
        try {
            const price = await stripe.prices.retrieve(id);
            console.log(`ID: ${id}`);
            console.log(`  Product: ${price.product}`);
            console.log(`  Amount: ${price.unit_amount! / 100} ${price.currency.toUpperCase()}`);
            console.log(`  Recurring: ${JSON.stringify(price.recurring)}`);
        } catch (err: any) {
            console.error(`ID: ${id} - ERROR: ${err.message}`);
        }
    }
}

checkPrices();
