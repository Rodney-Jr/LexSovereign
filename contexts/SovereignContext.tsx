
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionData, UserRole } from '../types';
import { getSavedSession } from '../utils/api';

interface SovereignContextType {
    session: SessionData | null;
    isLoading: boolean;
    setSession: (session: SessionData | null) => void;
    logout: () => void;
    can: (permission: string) => boolean;
}

const SovereignContext = createContext<SovereignContextType | undefined>(undefined);

export const SovereignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saved = getSavedSession();
        if (saved) {
            setSession(saved);
        }
        setIsLoading(false);

        const handleAuthFailed = () => {
            setSession(null);
        };
        
        window.addEventListener('nomosdesk-auth-failed', handleAuthFailed);
        return () => window.removeEventListener('nomosdesk-auth-failed', handleAuthFailed);
    }, []);

    const logout = () => {
        localStorage.removeItem('nomosdesk_session');
        localStorage.removeItem('nomosdesk_pin');
        setSession(null);
        // Dispatch a global event so other legacy hooks can react if needed
        window.dispatchEvent(new CustomEvent('nomosdesk-logout'));
    };

    const can = (permission: string) => {
        if (!session) return false;
        if (session.role === UserRole.GLOBAL_ADMIN) return true;
        
        // Handle both legacy ID check and action:resource check
        return session.permissions?.some(p => {
            if (permission.includes(':')) {
                const [action, resource] = permission.split(':');
                return p.action === action && p.resource === resource;
            }
            return p.id === permission;
        }) || false;
    };

    return (
        <SovereignContext.Provider value={{ session, isLoading, setSession, logout, can }}>
            {children}
        </SovereignContext.Provider>
    );
};

export const useSovereign = () => {
    const context = useContext(SovereignContext);
    if (context === undefined) {
        throw new Error('useSovereign must be used within a SovereignProvider');
    }
    return context;
};
