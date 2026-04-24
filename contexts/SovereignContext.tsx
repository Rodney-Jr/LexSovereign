
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionData, UserRole, AppMode } from '../types';
import { getSavedSession } from '../utils/api';

interface SovereignContextType {
    session: SessionData | null;
    isLoading: boolean;
    can: (permission: string) => boolean;
    targetTenant: { id: string, name: string, mode: AppMode } | null;
    setTargetTenant: (tenant: { id: string, name: string, mode: AppMode } | null) => void;
}

const SovereignContext = createContext<SovereignContextType | undefined>(undefined);

export const SovereignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [targetTenant, setTargetTenantState] = useState<{ id: string, name: string, mode: AppMode } | null>(null);

    useEffect(() => {
        const saved = getSavedSession();
        if (saved) {
            setSession(saved);
        }

        // Initialize targetTenant from localStorage
        const tid = localStorage.getItem('nomosdesk_target_tenant');
        const tname = localStorage.getItem('nomosdesk_target_tenant_name');
        const tmode = localStorage.getItem('nomosdesk_target_tenant_mode') as AppMode;
        if (tid && tname && tmode) {
            setTargetTenantState({ id: tid, name: tname, mode: tmode });
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
        localStorage.removeItem('nomosdesk_target_tenant');
        localStorage.removeItem('nomosdesk_target_tenant_name');
        localStorage.removeItem('nomosdesk_target_tenant_mode');
        setSession(null);
        setTargetTenantState(null);
        // Dispatch a global event so other legacy hooks can react if needed
        window.dispatchEvent(new CustomEvent('nomosdesk-logout'));
    };

    const setTargetTenant = (tenant: { id: string, name: string, mode: AppMode } | null) => {
        if (tenant) {
            localStorage.setItem('nomosdesk_target_tenant', tenant.id);
            localStorage.setItem('nomosdesk_target_tenant_name', tenant.name);
            localStorage.setItem('nomosdesk_target_tenant_mode', tenant.mode);
        } else {
            localStorage.removeItem('nomosdesk_target_tenant');
            localStorage.removeItem('nomosdesk_target_tenant_name');
            localStorage.removeItem('nomosdesk_target_tenant_mode');
        }
        setTargetTenantState(tenant);
        
        // Dispatch legacy event for backward compatibility
        window.dispatchEvent(new CustomEvent('nomosdesk-target-tenant-changed', { detail: tenant }));
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
        <SovereignContext.Provider value={{ session, isLoading, setSession, logout, can, targetTenant, setTargetTenant }}>
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
