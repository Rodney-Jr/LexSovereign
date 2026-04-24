import { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, SessionData } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';
import { authorizedFetch } from '../utils/api';
import { usePermissions } from './usePermissions';
import { useWorkPersistence } from './useWorkPersistence';
import { useSovereign } from '../contexts/SovereignContext';

export const useAuth = (activeTab: string, selectedMatter: string | null) => {
    const { setPermissions, setRole, setEnabledModules, role: contextRole } = usePermissions();
    const { setSession } = useSovereign();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
    const { recoverWork } = useWorkPersistence({ activeTab, selectedMatterId: selectedMatter });
    const isSyncing = useRef(false);

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
        if (!existingPin || existingPin === 'undefined' || existingPin === 'null') {
            console.log("[Auth] Missing or invalid pin. Triggering handshake...");
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
        setPermissions(activePermissions as any);
        setEnabledModules(session.enabledModules || ["CORE"]);
        setUserId(session.userId);
        setUserName(session.userName || null);
        setTenantId(session.tenantId);
        setToken(session.token || null);
        setMfaEnabled(!!session.mfaEnabled);
        if (session.mode) setMode(session.mode);
        setIsAuthenticated(true);

        return normalizedRole;
    }, [setRole, setPermissions, setEnabledModules]);

    const handleLogout = useCallback(async () => {
        // Clear server-side cookie by calling logout endpoint (non-blocking)
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});

        // Clear all local state and storage
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
        setTenantId(null);
        setToken(null);
        setMfaEnabled(false);
        setRole('');
        setPermissions([]);
        setEnabledModules(["CORE"]);

        // Explicitly clear storage
        localStorage.removeItem('nomosdesk_session');
        localStorage.removeItem('nomosdesk_pin');
        localStorage.removeItem('nomosdesk_activeTab');
        sessionStorage.removeItem('nomosdesk_session');
        // Synchronize with Sovereign Context
        setSession(null);
        
        // Use history API or soft-navigate if needed, but DO NOT hard reload
        // as that destroys in-flight error notifications.
        if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
        }
    }, [setRole, setPermissions, setEnabledModules, setSession]);

    // Native Sync Effect (Restore Session on Load)
    useEffect(() => {
        const syncSession = async () => {
            if (isSyncing.current) return;
            isSyncing.current = true;

            const storedSessionStr = localStorage.getItem('nomosdesk_session');
            if (storedSessionStr) {
                try {
                    const sessionData = JSON.parse(storedSessionStr);
                    const response = await fetch('/api/auth/me', {
                        headers: sessionData.token ? { 'Authorization': `Bearer ${sessionData.token}` } : undefined
                    });

                    if (response.ok) {
                        const verifiedSessionData = await response.json();
                        handleAuthenticated({
                            role: verifiedSessionData.user?.role || sessionData.role || 'UNKNOWN',
                            userId: verifiedSessionData.user?.id || sessionData.userId || '',
                            userName: verifiedSessionData.user?.name || sessionData.userName || '',
                            tenantId: verifiedSessionData.user?.tenantId || sessionData.tenantId || null,
                            tenantName: verifiedSessionData.user?.tenantName || sessionData.tenantName || '',
                            permissions: verifiedSessionData.user?.permissions || sessionData.permissions || [],
                            token: verifiedSessionData.token || sessionData.token
                        });
                    } else if (response.status === 401 || response.status === 403) {
                        const errData = await response.json().catch(() => ({}));
                        const errorMsg = errData.error || 'Session expired or invalidated.';
                        console.warn(`[useAuth] Backend session invalid (${response.status}):`, errorMsg);
                        
                        window.dispatchEvent(new CustomEvent('nomosdesk-api-error', {
                            detail: { message: 'Session Expired', description: errorMsg }
                        }));
                        
                        handleLogout();
                    }
                } catch (error) {
                    console.error('[useAuth] Sync failed:', error);
                    handleLogout();
                }
            }
            isSyncing.current = false;
        };

        syncSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for pin invalidation signals from the API layer
    useEffect(() => {
        const handlePinInvalid = () => {
            console.warn("[Auth] Pin invalidation signal received. Forcing re-handshake.");
            const storedSession = localStorage.getItem('nomosdesk_session');
            if (storedSession) {
                try {
                    const session = JSON.parse(storedSession);
                    handleAuthenticated(session);
                } catch (e) {
                    console.error("[Auth] Failed to re-handshake pin:", e);
                }
            }
        };

        window.addEventListener('nomosdesk-pin-invalid', handlePinInvalid);
    }, [handleAuthenticated]);

    // Listen for global logout events to ensure atomic state reset
    useEffect(() => {
        const handleGlobalLogout = () => {
            console.log("[Auth] Global logout signal detected. Syncing local state...");
            setIsAuthenticated(false);
            setUserId(null);
            setUserName(null);
            setToken(null);
        };
        window.addEventListener('nomosdesk-logout', handleGlobalLogout);
        return () => window.removeEventListener('nomosdesk-logout', handleGlobalLogout);
    }, []);

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
