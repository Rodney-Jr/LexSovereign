import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In production, this would be an environment variable
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface FxRateData {
    USD_GHS: number;
    GBP_GHS: number;
    date: string;
}

/**
 * Fetches latest rates from external API and syncs to database.
 */
export const syncDailyRates = async () => {
    console.log('[FX Sync] Starting daily exchange rate synchronization...');
    try {
        const response = await axios.get(API_URL);
        const rates = response.data.rates;

        if (!rates || !rates.GHS || !rates.GBP) {
            throw new Error('Invalid rate data received from provider');
        }

        const usdGhs = rates.GHS;
        const gbpGhs = rates.GHS / rates.GBP; // Deriving GBP/GHS from USD base

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Update or Create USD_GHS
        await prisma.dailyFxRate.upsert({
            where: {
                currencyPair_effectiveDate: {
                    currencyPair: 'USD_GHS',
                    effectiveDate: today,
                }
            },
            update: { rate: usdGhs, capturedAt: new Date() },
            create: {
                currencyPair: 'USD_GHS',
                rate: usdGhs,
                effectiveDate: today,
                provider: 'EXCHANGERATE_API'
            }
        });

        // Update or Create GBP_GHS
        await prisma.dailyFxRate.upsert({
            where: {
                currencyPair_effectiveDate: {
                    currencyPair: 'GBP_GHS',
                    effectiveDate: today,
                }
            },
            update: { rate: gbpGhs, capturedAt: new Date() },
            create: {
                currencyPair: 'GBP_GHS',
                rate: gbpGhs,
                effectiveDate: today,
                provider: 'EXCHANGERATE_API'
            }
        });

        console.log(`[FX Sync] Successfully synced rates for ${today.toISOString().split('T')[0]}: USD/GHS=${usdGhs}, GBP/GHS=${gbpGhs.toFixed(4)}`);
    } catch (error) {
        console.error('[FX Sync] Sync failed:', error);
        throw error;
    }
};

/**
 * Returns the latest rate for a given pair, with fallback to last known successful rate.
 */
export const getLatestRate = async (pair: string) => {
    try {
        const rateRecord = await prisma.dailyFxRate.findFirst({
            where: { currencyPair: pair },
            orderBy: { effectiveDate: 'desc' }
        });

        if (!rateRecord) {
            // Hard fallback for pilot if DB is empty
            const defaults: Record<string, number> = { 'USD_GHS': 12.5, 'GBP_GHS': 15.8 };
            return {
                rate: defaults[pair] || 1.0,
                isFallback: true,
                date: 'N/A (System Default)'
            };
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const isFallback = rateRecord.effectiveDate.getTime() < today.getTime();

        return {
            rate: rateRecord.rate,
            isFallback,
            date: rateRecord.effectiveDate.toISOString().split('T')[0]
        };
    } catch (error) {
        console.error(`[FX Service] Error fetching rate for ${pair}:`, error);
        return { rate: 12.5, isFallback: true, date: 'Error Fallback' };
    }
};
