
/**
 * NomosDesk API Utility
 * Provides robust fetch wrappers with automatic session handling
 */

export interface FetchOptions extends RequestInit {
    token?: string;
    silent?: boolean;
}

/**
 * Perform an authenticated request with robust error handling
 * Handles 403 Forbidden strings and JSON error objects gracefully
 */
export const getSovereignPin = () => {
    try {
        const storedPin = localStorage.getItem('nomosdesk_pin');
        if (storedPin && storedPin !== 'undefined' && storedPin !== 'null') {
            return storedPin;
        }
        // Access window property indirectly to bypass potential Vite 'define' replacements
        // and improve compatibility with SES strict environment
        return (window as any)['_SOVEREIGN_PIN_'] || import.meta.env.VITE_SOVEREIGN_PIN || '';
    } catch (e) {
        return '';
    }
};

export async function authorizedFetch(url: string, options: FetchOptions = {}) {
    const { token, silent, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers || {});
    // ... (rest of headers logic stays same)
    if (token && token !== 'undefined') {
        headers.set('Authorization', `Bearer ${token}`);
    } else {
        // Only log warning for non-public routes
        const isPublicAuth = 
            url.includes('/api/auth/resolve-invite') || 
            url.includes('/api/auth/login') || 
            url.includes('/api/auth/register') || 
            url.includes('/api/auth/forgot-password') ||
            url.includes('/api/pricing') ||
            url.includes('/api/stripe/create-checkout-session');
        if (!isPublicAuth) {
            console.warn(`[API-Diag] No token found for ${url}. Token Value: ${token}`);
        }
    }

    // Add Sovereign Pin if available (Prioritize dynamic handshake, fallback to window/global)
    const sovPin = getSovereignPin();
    if (sovPin) {
        headers.set('x-sov-pin', sovPin);
    }

    // --- NEW: Platform Management Context ---
    // If a Global Admin is managing a specific silo, inject the target tenant header
    try {
        const targetTenantId = localStorage.getItem('nomosdesk_target_tenant');
        if (targetTenantId && targetTenantId !== 'undefined' && targetTenantId !== 'null') {
            headers.set('x-target-tenant-id', targetTenantId);
        }
    } catch (e) {
        // Silently ignore localStorage errors in restricted environments
    }

    if (!headers.has('Content-Type') && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            credentials: 'include', // Ensure HttpOnly cookies are sent with every request
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

            // SMART ERROR HANDLING:
            // Only kill the session if the error is explicitly about the TOKEN being invalid/expired.
            // Do NOT kill the session for "Insufficient Permissions" or business logic denials.
            const isTokenError =
                response.status === 401 ||
                (response.status === 403 && (
                    errorData.code === 'FORBIDDEN' ||
                    errorData.error === 'Invalid session token' ||
                    errorData.reason === 'expired'
                ));

            if (isTokenError) {
                console.error(`[API] Session invalidated (${response.status}): ${errorData.error} | URL: ${url}`);
                if (url.includes('/pin')) {
                    console.warn("[API] PIN handshake failed. Check if SOVEREIGN_PIN matches on server.");
                }

                // Clear the failing token to prevent loops during re-fetch
                if (token && localStorage.getItem('nomosdesk_session')) {
                    const session = JSON.parse(localStorage.getItem('nomosdesk_session')!);
                    if (session.token === token) {
                        console.warn("[API] Clearing invalid session from storage");
                        localStorage.removeItem('nomosdesk_session');
                        localStorage.removeItem('nomosdesk_pin');
                    }
                }

                window.dispatchEvent(new CustomEvent('nomosdesk-auth-failed', {
                    detail: { status: response.status, error: errorData.error }
                }));
            } else if ((response.status === 402 || response.status === 403) && errorData.code === 'TRIAL_EXPIRED') {
                console.warn(`[API] Sovereign Trial Matured. Triggering UI Lockout.`);
                window.dispatchEvent(new CustomEvent('nomosdesk-trial-expired', {
                    detail: errorData
                }));
            } else if (response.status === 403 && (errorData.code === 'INVALID_SOVEREIGN_PIN' || errorData.error === 'Sovereign Enclave Access Denied')) {
                console.warn(`[API] Sovereign Enclave Access Denied (${response.status}). Clearing pin.`);
                localStorage.removeItem('nomosdesk_pin');
                window.dispatchEvent(new CustomEvent('nomosdesk-pin-invalid'));
            } else {
                console.warn(`[API] Request Forbidden (Business Logic/Permission): ${errorData.error}`);
                if (!silent) {
                    window.dispatchEvent(new CustomEvent('nomosdesk-api-error', {
                        detail: { 
                            message: errorData.error || 'Action Forbidden',
                            description: `Reference: ${response.status} at ${url.split('/').pop()}`
                        }
                    }));
                }
            }

            throw new Error(errorData.error || 'Request failed');
        }

        const text = await response.text();
        if (!text) return {}; // Handle empty successful response
        
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`[API] Failed to parse successful response for ${url}:`, text);
            return {};
        }
    } catch (error: any) {
        console.error(`[API Fetch Error] ${url}:`, error.message);
        if (!silent && !url.includes('/auth/login')) {
            window.dispatchEvent(new CustomEvent('nomosdesk-api-error', {
                detail: { 
                    message: 'Connection Failed',
                    description: error.message || 'The server could not be reached.'
                }
            }));
        }
        throw error;
    }
}

/**
 * Get current session from localStorage
 */
export function getSavedSession() {
    try {
        const saved = localStorage.getItem('nomosdesk_session');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}
