import { Router } from 'express';
import { getCachedRate } from '../services/fxWebSocketService';
import { getLatestRate } from '../services/fxRateService';

const router = Router();

/**
 * GET /api/fx-rates
 * Returns latest exchange rates for the Ghana jurisdiction.
 * Prefers live in-memory cache from FastForex WebSocket, falls back to DB records.
 */
router.get('/', async (req, res) => {
    try {
        // Try live WebSocket cache first (fastest)
        const liveUSD = getCachedRate('USDGHS');
        const liveGBP = getCachedRate('GBPGHS');

        const usdRate = liveUSD
            ? { rate: liveUSD, date: new Date().toISOString().split('T')[0], isFallback: false, source: 'LIVE_WS' }
            : { ...(await getLatestRate('USD_GHS')), source: 'DB' };

        const gbpRate = liveGBP
            ? { rate: liveGBP, date: new Date().toISOString().split('T')[0], isFallback: false, source: 'LIVE_WS' }
            : { ...(await getLatestRate('GBP_GHS')), source: 'DB' };

        res.json({
            success: true,
            rates: {
                USD_GHS: usdRate,
                GBP_GHS: gbpRate
            },
            disclaimer: 'Exchange rates are sourced from FastForex real-time feed and updated daily at 08:00 UTC as fallback.'
        });
    } catch (error) {
        console.error('[FX Routes] Error fetching rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exchange rates',
            fallback: { USD_GHS: { rate: 0, isFallback: true, source: 'ERROR' } }
        });
    }
});

export default router;
