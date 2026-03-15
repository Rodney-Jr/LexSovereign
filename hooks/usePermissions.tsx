import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Department } from '../types';
import { TAB_REQUIRED_PERMISSIONS } from '../constants';

// Define the shape of our context
interface PermissionContextType {
    permissions: string[];
    role: string | null;
    userId: string | null;
    department?: Department;
    separationMode: 'OPEN' | 'DEPARTMENTAL' | 'STRICT';
    enabledModules: string[];
    setPermissions: (perms: string[]) => void;
    setRole: (role: string) => void;
    setDepartment: (dept: Department) => void;
    setSeparationMode: (mode: 'OPEN' | 'DEPARTMENTAL' | 'STRICT') => void;
    setEnabledModules: (modules: string[]) => void;
    hasPermission: (permissionId: string) => boolean;
    hasAnyPermission: (permissionIds: string[]) => boolean;
    hasModule: (moduleId: string) => boolean;
    checkVisibility: (resource: any) => boolean;
    canAccessTab: (tabId: string) => boolean;
}

// Create context with default values
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Provider Component
export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [department, setDepartment] = useState<Department | undefined>(undefined);
    const [separationMode, setSeparationMode] = useState<'OPEN' | 'DEPARTMENTAL' | 'STRICT'>('OPEN');
    const [enabledModules, setEnabledModules] = useState<string[]>(["CORE"]);

    // Load from local storage on mount if available (for persistence across refreshes)
    useEffect(() => {
        const saved = localStorage.getItem('nomosdesk_session');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.permissions) setPermissions(parsed.permissions);
                if (parsed.role) setRole(parsed.role);
                if (parsed.userId) setUserId(parsed.userId);
                if (parsed.department) setDepartment(parsed.department);
                if (parsed.enabledModules) setEnabledModules(parsed.enabledModules);
                // separationMode might not be in session, but we can try
                if (parsed.separationMode) setSeparationMode(parsed.separationMode);
            } catch (e) {
                // invalid session
            }
        }
    }, []);

    const hasPermission = React.useCallback((permissionId: string): boolean => {
        if (role === 'GLOBAL_ADMIN') return true;
        return permissions.includes(permissionId);
    }, [role, permissions]);

    const hasAnyPermission = React.useCallback((permissionIds: string[]): boolean => {
        if (role === 'GLOBAL_ADMIN') return true;
        return permissionIds.some(id => permissions.includes(id));
    }, [role, permissions]);

    const hasModule = React.useCallback((moduleId: string): boolean => {
        if (role === 'GLOBAL_ADMIN') return true;
        if (enabledModules.includes('ALL')) return true;
        return enabledModules.includes(moduleId);
    }, [role, enabledModules]);

    const checkVisibility = React.useCallback((resource: any): boolean => {
        if (role === 'GLOBAL_ADMIN' || role === 'TENANT_ADMIN') return true;

        if (separationMode === 'OPEN') return true;

        if (separationMode === 'DEPARTMENTAL') {
            if (!resource.department) return true;
            return resource.department === department;
        }

        if (separationMode === 'STRICT') {
            if (resource.internalCounsel === userId) return true;
            if (resource.team && Array.isArray(resource.team)) {
                return resource.team.some((member: any) => member.id === userId);
            }
            if (resource.uploadedBy === userId) return true;
            return false;
        }

        return true;
    }, [role, separationMode, department, userId]);

    const canAccessTab = React.useCallback((tab: string): boolean => {
        // 1. Global Admin Override
        if (role === 'GLOBAL_ADMIN') return true;

        // 2. Permission-based Gating (Primary)
        const required = TAB_REQUIRED_PERMISSIONS[tab];
        if (required && required.length > 0) {
            return hasAnyPermission(required);
        }

        // 3. Fallback / Structural Role Rules
        // Platform owner items are STRICTLY for GLOBAL_ADMIN
        const platformTabs = ['platform-ops', 'global-governance', 'status', 'system-settings'];
        if (platformTabs.includes(tab)) return false;

        // Technical/Admin management items are for TENANT_ADMIN only (not MANAGING_PARTNER)
        const adminTabs = ['identity', 'tenant-admin'];
        if (role === 'MANAGING_PARTNER' && adminTabs.includes(tab)) return false;

        // Managing Partner gets default clearance for firm items
        if (role === 'MANAGING_PARTNER') return true;

        // If no specific permissions required, it is public/default
        if (!required || required.length === 0) return true;

        return false;
    }, [role, hasAnyPermission]);

    const updatePermissions = React.useCallback((perms: string[]) => {
        setPermissions(prev => {
            if (JSON.stringify(prev) === JSON.stringify(perms)) return prev;
            return perms;
        });
    }, []);

    const updateRole = React.useCallback((newRole: string | null) => {
        setRole(prev => (prev === newRole ? prev : newRole));
    }, []);

    const contextValue = React.useMemo(() => ({
        permissions,
        role,
        userId,
        department,
        separationMode,
        enabledModules,
        setPermissions: updatePermissions,
        setRole: updateRole,
        setDepartment,
        setSeparationMode,
        setEnabledModules,
        hasPermission,
        hasAnyPermission,
        hasModule,
        checkVisibility,
        canAccessTab
    }), [permissions, role, userId, department, separationMode, enabledModules, updatePermissions, updateRole, hasPermission, hasAnyPermission, hasModule, checkVisibility, canAccessTab]);

    return (
        <PermissionContext.Provider value={contextValue}>
            {children}
        </PermissionContext.Provider>
    );
};

// Hook for consuming the context
export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};
