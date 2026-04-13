/**
 * Studio Runner Configuration Utility
 */

interface GlobalConfig {
    VITE_API_URL?: string;
    VITE_PLATFORM_URL?: string;
}

declare global {
    interface Window {
        _GLOBAL_CONFIG?: GlobalConfig;
    }
}

export const getRuntimeConfig = (key: keyof GlobalConfig, fallback: string = ''): string => {
    // 1. Check for Runtime Injection (Production)
    const runtimeValue = window._GLOBAL_CONFIG?.[key];
    if (runtimeValue) return runtimeValue;

    // 2. Check for Build-time environment variable (Vite Dev / Static Build)
    const buildTimeValue = import.meta.env[key];
    if (buildTimeValue) return buildTimeValue as string;

    // 3. Fallback for Development
    if (import.meta.env.DEV) {
        if (key === 'VITE_API_URL') return 'http://localhost:3001';
        if (key === 'VITE_PLATFORM_URL') return 'http://localhost:3005';
    }

    return fallback;
};
