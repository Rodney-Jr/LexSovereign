import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Department, Permission } from '../types';
import { TAB_REQUIRED_PERMISSIONS } from '../constants';

// Define the shape of our context
interface PermissionContextType {
    permissions: Permission[];
    role: string | null;
    userId: string | null;
    department?: Department;
    separationMode: 'OPEN' | 'DEPARTMENTAL' | 'STRICT';
    enabledModules: string[];
    setPermissions: (perms: Permission[]) => void;
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
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [department, setDepartment] = useState<Department | undefined>(undefined);
    const [separationMode, setSeparationMode] = useState<'OPEN' | 'DEPARTMENTAL' | 'STRICT'>('OPEN');
    const [enabledModules, setEnabledModules] = useState<string[]>(["CORE", "ACCOUNTING_HUB", "HR_ENTERPRISE"]);

    const normalizePermissions = useCallback((perms: (string | Permission)[]): Permission[] => {
        const legacyMap: Record<string, string> = {
            'manage_tenant': 'MANAGE:TENANT_SETTINGS',
            'manage_users': 'MANAGE:USER',
            'manage_roles': 'MANAGE:ROLE',
            'read_billing': 'VIEW_BILLING:TENANT',
            'read_all_audits': 'VIEW_STATS:TENANT',
            'create_matter': 'CREATE:MATTER',
            'read_assigned_matter': 'VIEW:MATTER',
            'check_conflicts': 'CHECK:CONFLICTS',
            'review_work': 'REVIEW:WORK',
            'upload_document': 'UPLOAD:DOCUMENT',
            'create_draft': 'CREATE:DRAFT',
            'edit_draft': 'EDIT:DRAFT',
            'submit_review': 'SUBMIT:REVIEW',
            'approve_document': 'APPROVE:DOCUMENT',
            'export_final': 'EXPORT:DOCUMENT',
            'ai_chat_execute': 'EXECUTE:AI',
            'use_legal_chat': 'USE:CHAT',
            'view_confidential': 'VIEW:CONFIDENTIAL',
            'access_hr_workbench': 'ACCESS:HR',
            'access_accounting_hub': 'ACCESS:ACCOUNTING',
            'access_platform_roadmap': 'ACCESS:ROADMAP',
            'view_trial_status': 'VIEW:TRIAL',
            'view_clients': 'VIEW:CLIENT',
            'create_client': 'CREATE:CLIENT'
        };

        return perms.map(p => {
            let id = typeof p === 'string' ? p : p.id;
            
            // Apply legacy mapping if exists
            if (legacyMap[id]) {
                id = legacyMap[id]!;
            }

            // AUTO-BRIDGE: If ID uses underscores and is uppercase, or matches known legacy patterns
            // specifically handle MANAGE_USER, MANAGE_ROLE, etc.
            if (!id.includes(':')) {
                const upper = id.toUpperCase();
                if (upper === 'MANAGE_USER') id = 'MANAGE:USER';
                else if (upper === 'MANAGE_ROLE') id = 'MANAGE:ROLE';
                else if (upper === 'MANAGE_TENANT_SETTINGS') id = 'MANAGE:TENANT_SETTINGS';
                else if (upper === 'VIEW_STATS_TENANT') id = 'VIEW_STATS:TENANT';
                else if (upper === 'VIEW_BILLING_TENANT') id = 'VIEW_BILLING:TENANT';
                else if (upper === 'CREATE_MATTER') id = 'CREATE:MATTER';
                else if (upper === 'VIEW_MATTER') id = 'VIEW:MATTER';
                else if (upper === 'VIEW_CLIENTS' || upper === 'VIEW_CLIENT') id = 'VIEW:CLIENT';
                else if (upper === 'CREATE_CLIENT') id = 'CREATE:CLIENT';
            }

            if (id.includes(':')) {
                const [action, resource] = id.split(':');
                return { 
                    id, 
                    action: action || 'UNKNOWN', 
                    resource: resource || 'UNKNOWN' 
                };
            }
            
            // Fallback for untranslated strings
            if (typeof p === 'object') return p;
            return { id: p, action: 'LEGACY', resource: 'LEGACY' };
        });
    }, []);

    // Load from local storage on mount if available (for persistence across refreshes)
    useEffect(() => {
        const saved = localStorage.getItem('nomosdesk_session');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.permissions) {
                    setPermissions(normalizePermissions(parsed.permissions));
                }
                if (parsed.role) setRole(parsed.role);
                if (parsed.userId) setUserId(parsed.userId);
                if (parsed.department) setDepartment(parsed.department);
                
                // Merge default free modules with tenant's enabled modules
                const modules = parsed.enabledModules || ["CORE"];
                const freeModules = ["ACCOUNTING_HUB", "HR_ENTERPRISE"];
                const combined = Array.from(new Set([...modules, ...freeModules]));
                setEnabledModules(combined);
                
                // separationMode might not be in session, but we can try
                if (parsed.separationMode) setSeparationMode(parsed.separationMode);
            } catch (e) {
                // invalid session
            }
        }
    }, [normalizePermissions]);

    const hasPermission = React.useCallback((permissionId: string): boolean => {
        return permissions.some(p => {
            if (permissionId.includes(':')) {
                const [action, resource] = permissionId.split(':');
                return p.action === action && p.resource === resource;
            }
            return p.id === permissionId;
        });
    }, [role, permissions]);

    const hasAnyPermission = React.useCallback((permissionIds: string[]): boolean => {
        return permissionIds.some(id => hasPermission(id));
    }, [hasPermission]);

    const hasModule = React.useCallback((moduleId: string): boolean => {
        // HR and Accounting are now free for everyone
        if (moduleId === 'ACCOUNTING_HUB' || moduleId === 'HR_ENTERPRISE') return true;
        
        if (enabledModules.includes('ALL')) return true;
        return enabledModules.includes(moduleId);
    }, [enabledModules]);

    const checkVisibility = React.useCallback((resource: any): boolean => {
        if (role === 'GLOBAL_ADMIN' || role === 'TENANT_ADMIN') return true;

        if (separationMode === 'OPEN') return true;

        if (separationMode === 'DEPARTMENTAL') {
            if (!resource.department) return true;
            return resource.department === department;
        }

        if (separationMode === 'STRICT') {
            if (role === 'CLIENT') return true;
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
        // 1. Global Admin Override (Restrict to Platform specific sections and Dashboard)
        if (role === 'GLOBAL_ADMIN') {
            const platformTabs = ['dashboard', 'platform-ops', 'global-governance', 'status', 'system-settings', 'pricing-calib'];
            return platformTabs.includes(tab);
        }

        // 2. Permission-based Gating (Primary)
        const required = TAB_REQUIRED_PERMISSIONS[tab];
        if (required && required.length > 0) {
            return hasAnyPermission(required);
        }

        // 3. Fallback / Structural Role Rules
        // Platform owner items are STRICTLY for GLOBAL_ADMIN
        const platformTabs = ['platform-ops', 'global-governance', 'status', 'system-settings', 'pricing-calib'];
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

    const updatePermissions = React.useCallback((perms: (string | Permission)[]) => {
        setPermissions(prev => {
            const normalized = normalizePermissions(perms);
            if (JSON.stringify(prev) === JSON.stringify(normalized)) return prev;
            return normalized;
        });
    }, [normalizePermissions]);

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
        setPermissions: updatePermissions as any,
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
