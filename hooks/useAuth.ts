import { useState, useEffect, useCallback } from 'react';
import { UserRole, AppMode, SessionData } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { getSavedSession, authorizedFetch } from '../utils/api';
import { usePermissions } from './usePermissions';
import { useWorkPersistence } from './useWorkPersistence';



export const useAuth = (activeTab: string, selectedMatter: string | null) => {
    const { setPermissions, setRole, role: contextRole } = usePermissions();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
    const { recoverWork } = useWorkPersistence({ activeTab, selectedMatterId: selectedMatter });

    const handleAuthenticated = useCallback(async (session: SessionData) => {
        // Safely extract role - handle both string and object types
        const roleValue = typeof session.role === 'string'
            ? session.role
            : (session.role as any)?.name || 'UNKNOWN';
        const normalizedRole = roleValue.toUpperCase();

        // Hydrate permissions from constants or session
        const activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || session.permissions || [];

        // 1. Persist session first (so subsequent fetches have the token)
        const sessionToSave = {
            ...session,
            role: normalizedRole,
            permissions: activePermissions
        };
        localStorage.setItem('nomosdesk_session', JSON.stringify(sessionToSave));

        // 2. Immediate Pin Handshake (Crucial for Railway enclave access)
        // Optimization: Only handshake if we don't have a valid PIN or if token changed
        const existingPin = localStorage.getItem('nomosdesk_pin');
        if (!existingPin || existingPin === 'undefined') {
            console.log(`[Auth] Initiating PIN handshake for user: ${session.userId}...`);
            try {
                const data = await authorizedFetch('/api/auth/pin', {
                    token: session.token
                });
                if (data && data.pin) {
                    localStorage.setItem('nomosdesk_pin', data.pin);
                    console.log("[Auth] Sovereign Pin Handshake Successful");
                }
            } catch (e: any) {
                console.error("[Auth] Pin Handshake Failed during login:", e.message);
            }
        }

        // 3. Update state (Only if changed to prevent loops)
        setRole(normalizedRole);
        setPermissions(activePermissions);
        setUserId(prev => (prev === session.userId ? prev : session.userId));
        setUserName(prev => (prev === (session.userName || null) ? prev : (session.userName || null)));
        setTenantId(prev => (prev === session.tenantId ? prev : session.tenantId));
        if (session.mode) setMode(prev => (prev === session.mode ? prev : session.mode!));
        setIsAuthenticated(prev => (prev === true ? prev : true));

        return normalizedRole;
    }, [setRole, setPermissions]);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
        setTenantId(null);
        setRole('');
        setPermissions([]);
        localStorage.removeItem('nomosdesk_session');
        localStorage.removeItem('nomosdesk_pin');
        sessionStorage.removeItem('nomosdesk_session');
    }, [setRole, setPermissions]);

    // Initial session recovery
    useEffect(() => {
        const saved = localStorage.getItem('nomosdesk_session');
        if (saved) {
            try {
                const session = JSON.parse(saved) as SessionData;
                if (session.role && session.token) {
                    handleAuthenticated(session);
                }
            } catch (e) {
                console.error("[Auth] Session recovery failed", e);
                handleLogout();
            }
        }
    }, [handleAuthenticated, handleLogout]);

    return {
        isAuthenticated,
        userId,
        userName,
        tenantId,
        mode,
        setMode,
        contextRole,
        handleAuthenticated,
        handleLogout,
        recoverWork
    };
};
