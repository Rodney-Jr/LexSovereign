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
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [mode, setMode] = useState<AppMode>(AppMode.LAW_FIRM);
    const { recoverWork } = useWorkPersistence({ activeTab, selectedMatterId: selectedMatter });

    const handleAuthenticated = useCallback((session: SessionData) => {
        const normalizedRole = session.role.toUpperCase();

        // Hydrate permissions from constants or session
        const activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole] || session.permissions || [];

        setRole(normalizedRole);
        setPermissions(activePermissions);
        setUserId(session.userId);
        setTenantId(session.tenantId);
        if (session.mode) setMode(session.mode);
        setIsAuthenticated(true);

        // Persist session
        const sessionToSave = {
            ...session,
            role: normalizedRole,
            permissions: activePermissions
        };
        localStorage.setItem('lexSovereign_session', JSON.stringify(sessionToSave));

        return normalizedRole;
    }, [setRole, setPermissions]);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        setTenantId(null);
        setRole('');
        setPermissions([]);
        localStorage.removeItem('lexSovereign_session');
        sessionStorage.removeItem('lexSovereign_session');
    }, [setRole, setPermissions]);

    // Initial session recovery
    useEffect(() => {
        const saved = localStorage.getItem('lexSovereign_session') || sessionStorage.getItem('lexSovereign_session');
        if (saved) {
            try {
                const session = JSON.parse(saved) as SessionData;
                if (session.role) {
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
        tenantId,
        mode,
        setMode,
        contextRole,
        handleAuthenticated,
        handleLogout,
        recoverWork
    };
};
