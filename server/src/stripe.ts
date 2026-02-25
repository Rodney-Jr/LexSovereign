
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded before initialization
dotenv.config({ path: path.join(__dirname, '../.env') });

const secretKey = process.env.STRIPE_SECRET_KEY || '';

// Diagnostic validation
if (!secretKey) {
    console.warn('[Stripe] WARNING: STRIPE_SECRET_KEY is missing from environment.');
} else if (!secretKey.startsWith('sk_')) {
    console.error(`[Stripe] CRITICAL ERROR: STRIPE_SECRET_KEY does not appear to be a secret key (Prefix: ${secretKey.substring(0, 3)}). It might be a publishable key (pk_).`);
}

export const stripe = new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default stripe;
