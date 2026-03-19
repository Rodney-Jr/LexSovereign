import cron from 'node-cron';
import { syncDailyRates } from './fxRateService';

/**
 * Initializes scheduled jobs for the Sovereign Control Plane.
 */
export const initCronJobs = () => {
    console.log('[Cron] Initializing scheduled jobs...');

    // Schedule: 08:00 AM UTC daily — FX Rate Sync
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
                } catch (error: any) {
                    if (error.name === 'PrismaClientInitializationError') {
                        console.error(`[Cron] Database connection lost during Stripe sync for tenant ${tenant.id}. Skipping...`);
                        break;
                    }
                    console.error(`[Cron] Stripe sync failed for tenant ${tenant.id}:`, error.message);
                }
            }
        } catch (error: any) {
            if (error.name === 'PrismaClientInitializationError') {
                console.error('[Cron] Stripe sync job aborted: Database is unreachable.');
            } else {
                console.error('[Cron] Stripe sync job failed:', error.message);
            }
        }
    });

    // Schedule: Nightly Invoice Sweep (02:00 AM UTC every day)
    // Closes the billing gap: picks up time entries logged AFTER the billing component was
    // first created so no billable work slips through between billing cycles.
    cron.schedule('0 2 * * *', async () => {
        console.log('[Cron] Starting nightly invoice sweep (02:00 UTC)...');
        try {
            const { prisma } = await import('../db');
            const { BillingService } = await import('./BillingService');

            // All matters that have at least one active billing component
            const mattersWithBilling = await prisma.matter.findMany({
                where: {
                    billingComponents: {
                        some: { isActive: true }
                    }
                },
                select: { id: true, tenantId: true }
            });

            let invoiced = 0;
            let skipped = 0;

            for (const matter of mattersWithBilling) {
                try {
                    const result = await BillingService.evaluateInvoicingTriggers(matter.id, matter.tenantId);
                    if (result) {
                        invoiced++;
                        console.log(`[Cron] Invoice generated for matter ${matter.id}: $${result.totalAmount}`);
                    } else {
                        skipped++;
                    }
                } catch (err: any) {
                    console.error(`[Cron] Invoice sweep failed for matter ${matter.id}:`, err.message);
                }
            }

            console.log(`[Cron] Sweep complete — Invoiced: ${invoiced}, Skipped (nothing to bill): ${skipped}`);
        } catch (error: any) {
            if (error.name === 'PrismaClientInitializationError') {
                console.error('[Cron] Invoice sweep aborted: Database is unreachable.');
            } else {
                console.error('[Cron] Invoice sweep failed:', error.message);
            }
        }
    }, {
        timezone: "UTC"
    });

    // Run once on startup to ensure fresh FX data
    syncDailyRates().catch(err => console.error('[Cron] Initial startup sync failed:', err));
};
