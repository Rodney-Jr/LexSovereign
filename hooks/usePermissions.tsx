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

    const hasPermission = (permissionId: string): boolean => {
        // Global Admin bypass - Assuming GLOBAL_ADMIN has all permissions conceptually, 
        // or rely on the explicit list. Let's rely on explicit list to be safe, 
        // unless the list is missing 'manage_platform' which implies superuser.
        if (role === 'GLOBAL_ADMIN') return true;

        return permissions.includes(permissionId);
    };

    const hasAnyPermission = (permissionIds: string[]): boolean => {
        if (role === 'GLOBAL_ADMIN') return true;
        return permissionIds.some(id => permissions.includes(id));
    };

    const updatePermissions = (perms: string[]) => {
        setPermissions(perms);
        // Determine if we should save this back to session? Usually handled by auth flow, but good to keep sync.
    };

    return (
        <PermissionContext.Provider value={{
            permissions,
            role,
            setPermissions: updatePermissions,
            setRole,
            hasPermission,
            hasAnyPermission
        }}>
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
