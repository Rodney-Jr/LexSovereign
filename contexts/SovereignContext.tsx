
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
        window.location.href = '/'; 
    };

    const can = (permission: string) => {
        if (!session) return false;
        // Global Admins have all permissions by default in this architectural stage
        if (session.role === UserRole.GLOBAL_ADMIN) return true;
        return session.permissions?.includes(permission) || false;
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
