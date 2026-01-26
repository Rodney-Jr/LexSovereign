import { useEffect, useRef } from 'react';

export const useInactivityLogout = (onLogout: () => void, timeoutMs: number = 300000, enabled: boolean = true) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (!enabled) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            console.warn(`[Security] Session timed out after ${timeoutMs / 60000} minutes of inactivity.`);
            onLogout();
        }, timeoutMs);
    };

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimer();

        resetTimer();
        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [onLogout, timeoutMs, enabled]);

    return { resetTimer };
};

return { resetTimer };
};
