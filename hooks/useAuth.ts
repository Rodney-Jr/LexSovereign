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
        const normalizedRole = session.role.toUpperCase();

        // Hydrate permissions from constants or session
        const activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || session.permissions || [];

        // 1. Persist session first (so subsequent fetches have the token)
        const sessionToSave = {
            ...session,
            role: normalizedRole,
            permissions: activePermissions
        };
        localStorage.setItem('lexSovereign_session', JSON.stringify(sessionToSave));

        // 2. Immediate Pin Handshake (Crucial for Railway enclave access)
        try {
            const data = await authorizedFetch('/api/auth/pin', {
                token: session.token
            });
            if (data && data.pin) {
                localStorage.setItem('lexSovereign_pin', data.pin);
                console.log("[Auth] Sovereign Pin Handshake Successful");
            }
        } catch (e) {
            console.error("[Auth] Pin Handshake Failed during login", e);
        }

        // 3. Update state
        setRole(normalizedRole);
        setPermissions(activePermissions);
        setUserId(session.userId);
        setUserName(session.userName || null);
        setTenantId(session.tenantId);
        if (session.mode) setMode(session.mode);
        setIsAuthenticated(true);

        return normalizedRole;
    }, [setRole, setPermissions]);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
        setTenantId(null);
        setRole('');
        setPermissions([]);
        localStorage.removeItem('lexSovereign_session');
        localStorage.removeItem('lexSovereign_pin');
        sessionStorage.removeItem('lexSovereign_session');
    }, [setRole, setPermissions]);

    // Initial session recovery
    useEffect(() => {
        const saved = localStorage.getItem('lexSovereign_session');
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
