
import { UserRole } from './types';

// ... existing imports

export const TAB_PERMISSIONS: Record<string, UserRole[]> = {
  // Public / Common
  'dashboard': Object.values(UserRole),
  'settings': Object.values(UserRole),
  'status': Object.values(UserRole),

  // Platform Level (Global Admin Only)
  'platform-ops': [UserRole.GLOBAL_ADMIN],
  'enclave': [UserRole.GLOBAL_ADMIN],
  'audit': [UserRole.GLOBAL_ADMIN, UserRole.COMPLIANCE, UserRole.TENANT_ADMIN],

  // Tenant Admin / Governance
  'governance': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC],
  'tenant-admin': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN],
  'org-blueprint': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC],
  'integration-bridge': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN],
  'identity': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.LEGAL_OPS],
  'growth': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.FINANCE_BILLING],

  // Legal Operations
  'backlog': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.LEGAL_OPS],
  'conflict-check': [UserRole.GLOBAL_ADMIN, UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.INTERNAL_COUNSEL],
  'reviews': [UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.INTERNAL_COUNSEL],
  'workflow': [UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.INTERNAL_COUNSEL, UserRole.LEGAL_OPS],

  // Core Legal Work
  'vault': [UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.INTERNAL_COUNSEL, UserRole.EXTERNAL_COUNSEL, UserRole.LEGAL_OPS, UserRole.CLIENT],
  'chat': [UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.INTERNAL_COUNSEL, UserRole.EXTERNAL_COUNSEL, UserRole.LEGAL_OPS, UserRole.CLIENT],

  // Client Specific
  'client': [UserRole.CLIENT, UserRole.TENANT_ADMIN],
  'predictive': [UserRole.TENANT_ADMIN, UserRole.LEGAL_OPS, UserRole.DEPUTY_GC]
};
