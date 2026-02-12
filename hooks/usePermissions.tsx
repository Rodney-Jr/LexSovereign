import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface PermissionContextType {
    permissions: string[];
    role: string | null;
    setPermissions: (perms: string[]) => void;
    setRole: (role: string) => void;
    hasPermission: (permissionId: string) => boolean;
    hasAnyPermission: (permissionIds: string[]) => boolean;
    // hasAllPermissions: (permissionIds: string[]) => boolean; // YAGNI for now
}

// Create context with default values
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Provider Component
export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [role, setRole] = useState<string | null>(null);

    // Load from local storage on mount if available (for persistence across refreshes)
    useEffect(() => {
        const saved = localStorage.getItem('lexSovereign_session');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.permissions) setPermissions(parsed.permissions);
                if (parsed.role) setRole(parsed.role);
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
        const result = permissionIds.some(id => permissions.includes(id));

        // Debug logging for tenant admin
        if (role === 'TENANT_ADMIN' && !result) {
            console.log(`[Permissions] TENANT_ADMIN missing permissions. Required: [${permissionIds.join(', ')}], Has: [${permissions.join(', ')}]`);
        }

        return result;
    }, [role, permissions]);

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
        setPermissions: updatePermissions,
        setRole: updateRole,
        hasPermission,
        hasAnyPermission
    }), [permissions, role, updatePermissions, updateRole, hasPermission, hasAnyPermission]);

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
