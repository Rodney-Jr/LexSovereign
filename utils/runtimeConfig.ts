/**
 * Sovereign Runtime Configuration Utility
 * 
 * In production, environment variables are injected into index.html by the server
 * to bypass Vite's build-time baking. This utility provides a unified way to 
 * access these variables in both Dev and Prod.
 */

interface GlobalConfig {
    VITE_STUDIO_URL?: string;
    VITE_API_URL?: string;
    VITE_PLATFORM_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    SOVEREIGN_PIN?: string;
}

declare global {
    interface Window {
        _GLOBAL_CONFIG?: GlobalConfig;
        _GOOGLE_CLIENT_ID?: string;
        _SOVEREIGN_PIN_?: string;
    }
}

export const getRuntimeConfig = (key: keyof GlobalConfig, fallback: string = ''): string => {
    // 1. Check for Runtime Injection (Production)
    const runtimeValue = window._GLOBAL_CONFIG?.[key];
    if (runtimeValue) return runtimeValue;

    // 2. Legacy / Native Injections
    if (key === 'GOOGLE_CLIENT_ID' && window._GOOGLE_CLIENT_ID) return window._GOOGLE_CLIENT_ID;
    if (key === 'SOVEREIGN_PIN' && window._SOVEREIGN_PIN_) return window._SOVEREIGN_PIN_;

    // 3. Check for Build-time environment variable (Vite Dev / Static Build)
    const buildTimeValue = import.meta.env[key];
    if (buildTimeValue) return buildTimeValue as string;

    // 4. Fallback for Development
    if (import.meta.env.DEV) {
        if (key === 'VITE_STUDIO_URL') return 'http://localhost:3006';
        if (key === 'VITE_API_URL') return 'http://localhost:3001';
        if (key === 'VITE_PLATFORM_URL') return 'http://localhost:3005';
    }

    return fallback;
};
