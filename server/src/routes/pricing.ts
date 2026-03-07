import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sovereignGuard } from '../middleware/sovereignGuard';

const router = express.Router();

// Get Pricing Config (Public for Onboarding)
router.get('/', async (req, res) => {
    try {
        const configs = await prisma.pricingConfig.findMany();

        // If no configs exist in DB, return default configs
        if (configs.length === 0) {
            const defaultConfigs = [
                {
                    id: 'Solo',
                    basePrice: 19,
                    pricePerUser: 5,
                    creditsIncluded: 0,
                    maxUsers: 5,
                    features: ['3 User Seats', 'Core Case Management', 'Digital Intake Hub', 'Mobile-First Access', 'Metered AI Top-ups (Pay-per-use)'],
                    stripeBasePriceId: 'price_1T8RidE9NGotUyVqrCuwNIcv',
                    stripeUserPriceId: 'price_1T8RidE9NGotUyVqfi0aB0aL',
                    updatedAt: new Date()
                },
                {
                    id: 'Professional',
                    basePrice: 79,
                    pricePerUser: 10,
                    creditsIncluded: 5000,
                    maxUsers: 50,
                    features: ['10 User Seats', '5,000 AI Credits Included', 'Professional Enclave Branding', 'Advanced Financial Reporting', 'Priority Disbursement Tracking'],
                    stripeBasePriceId: 'price_1T8RieE9NGotUyVqMACuoRfl',
                    stripeUserPriceId: 'price_1T8RieE9NGotUyVqitNvjs0g',
                    updatedAt: new Date()
                },
                {
                    id: 'Institutional',
                    basePrice: 299,
                    pricePerUser: 0,
                    creditsIncluded: 20000,
                    maxUsers: 10000,
                    features: ['Unlimited User Seats', '20,000 AI Credits Included', 'Dedicated Sovereign Region', 'SSO & 2FA Enclave Security', '99.9% Sovereign Uptime SLA'],
                    stripeBasePriceId: 'price_1T8RifE9NGotUyVqC040EUIR',
                    stripeUserPriceId: 'price_1T8RigE9NGotUyVqjAsh74OT',
                    updatedAt: new Date()
                }
            ];
            return res.json(defaultConfigs);
        }

        return res.json(configs);
    } catch (error: any) {
        console.error('Pricing API Error:', error);

        // P2021: Table doesn't exist (migrations not run)
        // Return default configs instead of failing
        if (error.code === 'P2021') {
            console.warn('⚠️  PricingConfig table does not exist. Returning default configs. Run migrations: npx prisma migrate deploy');
            const defaultConfigs = [
                {
                    id: 'Solo',
                    basePrice: 19,
                    pricePerUser: 5,
                    creditsIncluded: 0,
                    maxUsers: 5,
                    features: ['3 User Seats', 'Core Case Management', 'Digital Intake Hub', 'Mobile-First Access', 'Metered AI Top-ups (Pay-per-use)'],
                    stripeBasePriceId: 'price_1T8RidE9NGotUyVqrCuwNIcv',
                    stripeUserPriceId: 'price_1T8RidE9NGotUyVqfi0aB0aL',
                    updatedAt: new Date()
                },
                {
                    id: 'Professional',
                    basePrice: 79,
                    pricePerUser: 10,
                    creditsIncluded: 5000,
                    maxUsers: 50,
                    features: ['10 User Seats', '5,000 AI Credits Included', 'Professional Enclave Branding', 'Advanced Financial Reporting', 'Priority Disbursement Tracking'],
                    stripeBasePriceId: 'price_1T8RieE9NGotUyVqMACuoRfl',
                    stripeUserPriceId: 'price_1T8RieE9NGotUyVqitNvjs0g',
                    updatedAt: new Date()
                },
                {
                    id: 'Institutional',
                    basePrice: 299,
                    pricePerUser: 0,
                    creditsIncluded: 20000,
                    maxUsers: 10000,
                    features: ['Unlimited User Seats', '20,000 AI Credits Included', 'Dedicated Sovereign Region', 'SSO & 2FA Enclave Security', '99.9% Sovereign Uptime SLA'],
                    stripeBasePriceId: 'price_1T8RifE9NGotUyVqC040EUIR',
                    stripeUserPriceId: 'price_1T8RigE9NGotUyVqjAsh74OT',
                    updatedAt: new Date()
                }
            ];
            return res.json(defaultConfigs);
        }

        return res.status(500).json({ error: error.message });
    }
});

// Update Pricing Config (Global Admin Only)
router.put('/:id', sovereignGuard, authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { basePrice, pricePerUser, creditsIncluded, features, stripeBasePriceId, stripeUserPriceId } = req.body;

        const updated = await (prisma.pricingConfig as any).update({
            where: { id },
            data: {
                basePrice,
                pricePerUser,
                creditsIncluded,
                features,
                stripeBasePriceId,
                stripeUserPriceId
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update pricing configuration' });
    }
});

export default router;
