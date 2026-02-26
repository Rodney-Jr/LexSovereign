import { useState, useEffect, useCallback } from 'react';
import { AppMode, SessionData } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { authorizedFetch } from '../utils/api';
import { usePermissions } from './usePermissions';
import { useWorkPersistence } from './useWorkPersistence';

export const useAuth = (activeTab: string, selectedMatter: string | null) => {
    const { setPermissions, setRole, role: contextRole } = usePermissions();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
    const { recoverWork } = useWorkPersistence({ activeTab, selectedMatterId: selectedMatter });

    const handleAuthenticated = useCallback(async (session: SessionData) => {
        const roleValue = typeof session.role === 'string'
            ? session.role
            : (session.role as any)?.name || 'UNKNOWN';
        const normalizedRole = roleValue.toUpperCase();

        const activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || session.permissions || [];

        const sessionToSave = {
            ...session,
            role: normalizedRole,
            permissions: activePermissions
        };
        localStorage.setItem('nomosdesk_session', JSON.stringify(sessionToSave));

        const existingPin = localStorage.getItem('nomosdesk_pin');
        if (!existingPin || existingPin === 'undefined') {
            try {
                const data = await authorizedFetch('/api/auth/pin', {
                    token: session.token
                });
                if (data && data.pin) {
                    localStorage.setItem('nomosdesk_pin', data.pin);
                }
            } catch (e: any) {
                console.error("[Auth] Pin Handshake Failed during login:", e.message);
            }
        }

        setRole(normalizedRole);
        setPermissions(activePermissions);
        setUserId(session.userId);
        setUserName(session.userName || null);
        setTenantId(session.tenantId);
        setToken(session.token || null);
        setMfaEnabled(!!session.mfaEnabled);
        if (session.mode) setMode(session.mode);
        setIsAuthenticated(true);

        return normalizedRole;
    }, [setRole, setPermissions]);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
        setTenantId(null);
        setToken(null);
        setMfaEnabled(false);
        setRole('');
        setPermissions([]);
        localStorage.removeItem('nomosdesk_session');
        localStorage.removeItem('nomosdesk_pin');
        sessionStorage.removeItem('nomosdesk_session');
    }, [setRole, setPermissions]);

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
        token,
        mfaEnabled,
        mode,
        setMode,
        contextRole,
        handleAuthenticated,
        handleLogout,
        recoverWork
    };
};
