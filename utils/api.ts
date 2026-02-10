
/**
 * LexSovereign API Utility
 * Provides robust fetch wrappers with automatic session handling
 */

export interface FetchOptions extends RequestInit {
    token?: string;
}

/**
 * Perform an authenticated request with robust error handling
 * Handles 403 Forbidden strings and JSON error objects gracefully
 */
// Declare the global constant injected by Vite
declare const __SOVEREIGN_PIN__: string;

export async function authorizedFetch(url: string, options: FetchOptions = {}) {
    const { token, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Add Sovereign Pin if available (Prioritize dynamic handshake, fallback to window/global)
    const sovPin = localStorage.getItem('lexSovereign_pin') ||
        (window as any)._SOVEREIGN_PIN_ ||
        (typeof __SOVEREIGN_PIN__ !== 'undefined' ? __SOVEREIGN_PIN__ : '');
    if (sovPin) {
        headers.set('x-sov-pin', sovPin);
    }

    if (!headers.has('Content-Type') && fetchOptions.body) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers
        });

        if (!response.ok) {
            const text = await response.text();
            let errorData: any = { error: 'Unknown Error' };

            try {
                errorData = JSON.parse(text);
            } catch (e) {
                // Return plain text if not JSON (e.g. "Forbidden")
                errorData = { error: text || `Error ${response.status}`, raw: true };
            }

            if (response.status === 401 || response.status === 403) {
                console.error(`[API] Session invalidated (${response.status}): ${errorData.error} | URL: ${url}`);
                if (url.includes('/pin')) {
                    console.warn("[API] PIN handshake failed. Check if SOVEREIGN_PIN matches on server.");
                }

                // Clear the failing token to prevent loops during re-fetch
                if (token && localStorage.getItem('lexSovereign_session')) {
                    const session = JSON.parse(localStorage.getItem('lexSovereign_session')!);
                    if (session.token === token) {
                        console.warn("[API] Clearing invalid session from storage");
                        localStorage.removeItem('lexSovereign_session');
                        localStorage.removeItem('lexSovereign_pin');
                    }
                }

                window.dispatchEvent(new CustomEvent('lex-sovereign-auth-failed', {
                    detail: { status: response.status, error: errorData.error }
                }));
            }

            throw new Error(errorData.error || 'Request failed');
        }

        return await response.json();
    } catch (error: any) {
        console.error(`[API Fetch Error] ${url}:`, error.message);
        throw error;
    }
}

/**
 * Get current session from localStorage
 */
export function getSavedSession() {
    try {
        const saved = localStorage.getItem('lexSovereign_session');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}
