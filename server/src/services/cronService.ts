import cron from 'node-cron';
import { syncDailyRates } from './fxRateService';

/**
 * Initializes scheduled jobs for the Sovereign Control Plane.
 */
export const initCronJobs = () => {
    console.log('[Cron] Initializing scheduled jobs...');

    // Schedule: 08:00 AM UTC daily
    // Format: minute hour day-of-month month day-of-week
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Triggering daily exchange rate sync (08:00 UTC)');
        try {
            await syncDailyRates();
        } catch (error) {
            console.error('[Cron] Daily rate sync failed:', error);
        }
    }, {
        scheduled: true,
        timezone: "UTC"
    });

    // Run once on startup to ensure fresh data (Optional, but good for pilot)
    syncDailyRates().catch(err => console.error('[Cron] Initial startup sync failed:', err));
};
