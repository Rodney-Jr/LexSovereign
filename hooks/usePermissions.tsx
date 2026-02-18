import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Department } from '../types';

// Define the shape of our context
interface PermissionContextType {
    permissions: string[];
    role: string | null;
    userId: string | null;
    department?: Department;
    separationMode: 'OPEN' | 'DEPARTMENTAL' | 'STRICT';
    setPermissions: (perms: string[]) => void;
    setRole: (role: string) => void;
    setDepartment: (dept: Department) => void;
    setSeparationMode: (mode: 'OPEN' | 'DEPARTMENTAL' | 'STRICT') => void;
    hasPermission: (permissionId: string) => boolean;
    hasAnyPermission: (permissionIds: string[]) => boolean;
    checkVisibility: (resource: any) => boolean;
    // hasAllPermissions: (permissionIds: string[]) => boolean; // YAGNI for now
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

    const checkVisibility = React.useCallback((resource: any): boolean => {
        if (role === 'GLOBAL_ADMIN' || role === 'TENANT_ADMIN') return true; // Admins see all

        // OPEN Mode: Everyone sees everything (unless specifically restricted, but that's handled elsewhere)
        if (separationMode === 'OPEN') return true;

        // DEPARTMENTAL Mode: Must match department
        if (separationMode === 'DEPARTMENTAL') {
            if (!resource.department) return true; // Unassigned resources are visible to all in dept mode? Or maybe implied global? Let's say visible.
            return resource.department === department;
        }

        // STRICT Mode: Must be assigned
        if (separationMode === 'STRICT') {
            // Check implicit assignment via ID (e.g. if I am the internalCounsel or in the team)
            if (resource.internalCounsel === userId) return true;
            if (resource.team && Array.isArray(resource.team)) {
                return resource.team.some((member: any) => member.id === userId);
            }
            // If it's a document context, maybe check 'uploadedBy'
            if (resource.uploadedBy === userId) return true;

            return false;
        }

        return true;
    }, [role, separationMode, department, userId]);

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
        setPermissions: updatePermissions,
        setRole: updateRole,
        setDepartment,
        setSeparationMode,
        hasPermission,
        hasAnyPermission,
        checkVisibility
    }), [permissions, role, userId, department, separationMode, updatePermissions, updateRole, hasPermission, hasAnyPermission, checkVisibility]);

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
