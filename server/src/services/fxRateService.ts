import axios from 'axios';
import { prisma } from '../db';

export class FxRateService {
    private static readonly API_URL = 'https://v6.exchangerate-api.com/v6';
    private static readonly API_KEY = process.env.EXCHANGERATE_API_KEY;

    /**
     * Syncs exchange rates for common currency pairs used in the platform.
     */
    static async syncRates() {
        if (!this.API_KEY) {
            console.warn('[FxRateService] EXCHANGERATE_API_KEY missing. Skipping sync.');
            return;
        }

        const baseCurrency = 'USD';
        const targetCurrencies = ['GHS', 'EUR', 'GBP', 'NGN'];

        try {
            const response = await axios.get(`${this.API_URL}/${this.API_KEY}/latest/${baseCurrency}`);
            const rates = response.data.conversion_rates;

            for (const target of targetCurrencies) {
                const rate = rates[target];
                if (rate) {
                    await prisma.dailyFxRate.upsert({
                        where: {
                            currencyPair_effectiveDate: {
                                currencyPair: `${baseCurrency}/${target}`,
                                effectiveDate: new Date()
                            }
                        },
                        update: {
                            rate,
                            capturedAt: new Date()
                        },
                        create: {
                            currencyPair: `${baseCurrency}/${target}`,
                            rate,
                            effectiveDate: new Date(),
                            provider: 'EXCHANGERATE_API'
                        }
                    });
                }
            }
            console.log(`[FxRateService] Successfully synced rates for ${targetCurrencies.join(', ')}`);
        } catch (error: any) {
            console.error(`[FxRateService] Sync failed: ${error.message}`);
        }
    }
}

export const syncDailyRates = () => FxRateService.syncRates();

/**
 * Returns the most recent rate for a given currency pair.
 * Accepts both "USD_GHS" and "USD/GHS" notation.
 */
export async function getLatestRate(pair: string): Promise<{ rate: number; date: string; isFallback: boolean }> {
    // Normalise underscore notation (USD_GHS) to slash notation (USD/GHS)
    const normalisedPair = pair.replace('_', '/');

    const record = await prisma.dailyFxRate.findFirst({
        where: { currencyPair: normalisedPair },
        orderBy: { effectiveDate: 'desc' }
    });

    if (!record) {
        return { rate: 0, date: 'N/A', isFallback: true };
    }

    return {
        rate: record.rate,
        date: record.effectiveDate.toISOString().split('T')[0],
        isFallback: false
    };
}
