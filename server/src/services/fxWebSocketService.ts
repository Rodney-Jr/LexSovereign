import WebSocket from 'ws';
import { prisma } from '../db';

const WS_URL = 'wss://fastforex.wsdx.io';

// Currency pairs to subscribe to (base USD, target the pairs we care about)
const SUBSCRIBE_PAIRS = ['USDGHS', 'USDEUR', 'USDGBP', 'USDNGN'];

// In-memory latest rates cache for fast reads
const rateCache: Record<string, { rate: number; ts: string }> = {};

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

function connect() {
    const apiKey = process.env.FASTFOREX_API_KEY;
    if (!apiKey) {
        console.warn('[FxWS] FASTFOREX_API_KEY missing — WebSocket feed disabled.');
        return;
    }

    // Append API key as query param (FastForex / PrimeAPI pattern)
    const url = `${WS_URL}?api_key=${apiKey}`;
    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('[FxWS] Connected to FastForex streaming feed.');

        // Subscribe to required pairs
        const subscribeMsg = JSON.stringify({
            type: 'subscribe',
            pairs: SUBSCRIBE_PAIRS
        });
        ws!.send(subscribeMsg);
    });

    ws.on('message', async (data) => {
        try {
            const tick = JSON.parse(data.toString());

            // Expected tick format: { pair: "USDGHS", ask: 12.5, bid: 12.4, ts: "..." }
            if (!tick.pair || !tick.ask) return;

            const pair = tick.pair as string;
            const rate: number = (tick.ask + (tick.bid || tick.ask)) / 2; // Mid-rate
            const formatted = `${pair.slice(0, 3)}/${pair.slice(3)}`; // USDGHS → USD/GHS
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Update in-memory cache
            rateCache[pair] = { rate, ts: tick.ts || new Date().toISOString() };

            // Upsert into DailyFxRate table (once per day)
            await prisma.dailyFxRate.upsert({
                where: {
                    currencyPair_effectiveDate: {
                        currencyPair: formatted,
                        effectiveDate: today
                    }
                },
                update: { rate, capturedAt: new Date() },
                create: {
                    currencyPair: formatted,
                    rate,
                    effectiveDate: today,
                    provider: 'FASTFOREX_WS'
                }
            });
        } catch (err: any) {
            console.error('[FxWS] Failed to process tick:', err.message);
        }
    });

    ws.on('close', (code) => {
        console.warn(`[FxWS] Disconnected (code: ${code}). Reconnecting in 5s...`);
        scheduleReconnect();
    });

    ws.on('error', (err) => {
        console.error('[FxWS] WebSocket error:', err.message);
        ws?.terminate();
    });
}

function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
        console.log('[FxWS] Attempting reconnect...');
        connect();
    }, 5000);
}

/**
 * Returns a cached rate (mid-price) for a given pair.
 * Accepts both "USD_GHS" and "USDGHS" notation.
 */
export function getCachedRate(pair: string): number | null {
    const normalised = pair.replace('_', '').replace('/', '').toUpperCase();
    return rateCache[normalised]?.rate ?? null;
}

/**
 * Start the FastForex WebSocket connection.
 * Called once at server startup.
 */
export function startFxWebSocket() {
    connect();
}

export { rateCache };
