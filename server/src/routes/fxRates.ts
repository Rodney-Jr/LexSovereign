import { Router } from 'express';
import { getLatestRate } from '../services/fxRateService';
import { sovereignGuard } from '../middleware/sovereignGuard';

const router = Router();

/**
 * GET /api/fx-rates
 * Returns latest exchange rates for the Ghana jurisdiction.
 */
router.get('/', sovereignGuard, async (req, res) => {
    try {
        const usdRate = await getLatestRate('USD_GHS');
        const gbpRate = await getLatestRate('GBP_GHS');

        res.json({
            success: true,
            rates: {
                USD_GHS: usdRate,
                GBP_GHS: gbpRate
            },
            disclaimer: 'Exchange rates are sourced from the Interbank market and updated daily at 08:00 UTC.'
        });
    } catch (error) {
        console.error('[FX Routes] Error fetching rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exchange rates',
            fallback: { USD_GHS: { rate: 12.5, isFallback: true, date: 'Error' } }
        });
    }
});

export default router;
