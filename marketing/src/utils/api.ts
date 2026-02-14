/**
 * Shared API utility for LexSovereign Marketing Website
 * Ensures robust URL construction regardless of environment variable formatting
 */

export const getApiUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    // Remove trailing slashes from base URL
    const cleanBase = baseUrl.replace(/\/+$/, '');
    // Ensure path starts with a single slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    const finalUrl = `${cleanBase}${cleanPath}`;

    // In development with no VITE_API_URL, we rely on Vite proxy
    // If baseUrl is empty, it returns just /api/... which Vite proxy handles
    return finalUrl;
};

/**
 * Enhanced fetch wrapper with automatic URL construction and logging
 */
export const apiFetch = async (path: string, options: RequestInit = {}) => {
    const url = getApiUrl(path);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`, { url, method: options.method || 'GET' });
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response;
    } catch (error: any) {
        console.error('Network or API Error:', error, { url });
        throw error;
    }
};
