import { useState, useEffect } from 'react';

export type ThemeMode = 'midnight' | 'gold' | 'cyber' | 'light';

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeMode>('midnight');

    useEffect(() => {
        const savedTheme = localStorage.getItem('nomosdesk_theme') as ThemeMode;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Remove existing theme classes
        document.body.classList.remove('theme-midnight', 'theme-gold', 'theme-cyber', 'theme-light');
        // Add current theme class
        document.body.classList.add(`theme-${theme}`);
        // Save to local storage
        localStorage.setItem('nomosdesk_theme', theme);
    }, [theme]);

    return { theme, setTheme };
};
