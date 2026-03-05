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
        timezone: "UTC"
    });

    // Schedule: Hourly usage sync to Stripe
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Triggering hourly Stripe usage sync');
        try {
            const { prisma } = await import('../db');
            const { StripeService } = await import('./StripeService');

            const tenants = await prisma.tenant.findMany({
                where: { stripeSubscriptionId: { not: null } }
            });

            for (const tenant of tenants) {
                try {
                    await StripeService.syncUsageToStripe(tenant.id);
                } catch (error) {
                    console.error(`[Cron] Stripe sync failed for tenant ${tenant.id}:`, error);
                }
            }
        } catch (error) {
            console.error('[Cron] Stripe sync job failed:', error);
        }
    });

    // Run once on startup to ensure fresh data (Optional, but good for pilot)
    syncDailyRates().catch(err => console.error('[Cron] Initial startup sync failed:', err));
};
