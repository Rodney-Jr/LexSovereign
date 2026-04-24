import { useEffect, useRef } from 'react';
import { getSavedSession } from '../utils/api';

/**
 * useMatterStream — Live SSE collaboration signals
 *
 * Opens a persistent Server-Sent Events connection to /api/matters/:id/stream
 * and calls onMessage whenever the server pushes a new collaboration message.
 *
 * Auth strategy: passes the JWT as a ?token= query param since EventSource
 * cannot set custom Authorization headers. Cookie auth is also supported
 * automatically by the browser.
 *
 * The connection is cleaned up when the component unmounts or matterId changes.
 */
export function useMatterStream(
    matterId: string | undefined,
    onMessage: (msg: any) => void
) {
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage; // Always call latest handler without re-subscribing

    useEffect(() => {
        if (!matterId) return;

        // Skip mock matter IDs that don't exist in the database
        if (/^(MAT-|MT-)/.test(matterId)) return;

        const session = getSavedSession();
        const token = session?.token;

        // Build SSE URL — token fallback for EventSource (can't set headers)
        const url = token
            ? `/api/matters/${matterId}/stream?token=${encodeURIComponent(token)}`
            : `/api/matters/${matterId}/stream`;

        let es: EventSource;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            es = new EventSource(url);

            es.onopen = () => {
                console.log(`[SSE] Connected to matter stream: ${matterId}`);
            };

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_message') {
                        onMessageRef.current(data.message);
                    }
                    // 'connected' type is just an ack — no action needed
                } catch (e) {
                    console.warn('[SSE] Failed to parse event:', event.data);
                }
            };

            es.onerror = (err) => {
                console.warn('[SSE] Connection error, will retry in 5s:', err);
                es.close();
                // Auto-reconnect after 5 seconds
                reconnectTimeout = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            es?.close();
            console.log(`[SSE] Disconnected from matter stream: ${matterId}`);
        };
    }, [matterId]); // Re-subscribe only if matterId changes
}
