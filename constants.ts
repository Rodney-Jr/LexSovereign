
import { RegulatoryRule, DocumentMetadata, AppMode, UserRole, Matter, Region } from './types';


export const INITIAL_RULES: RegulatoryRule[] = [
  { id: 'REG-001', name: 'GDPR Data Sovereignty', description: 'Ensure EU user data remains within EU enclaves.', region: Region.GERMANY, isActive: true, authority: 'EU Commission', triggerKeywords: ['personal data', 'eu citizen'], blockThreshold: 0.8 },
  { id: 'REG-002', name: 'CCPA Consumer Rights', description: 'Enforce right to deletion for CA residents.', region: Region.USA, isActive: true, authority: 'California State', triggerKeywords: ['california', 'consumer'], blockThreshold: 0.7 },
  { id: 'REG-003', name: 'Banking Secrecy Act', description: 'Flag transactions over $10k for review.', region: Region.USA, isActive: false, authority: 'FinCEN', triggerKeywords: ['transaction', 'structuring'], blockThreshold: 0.9 }
];

export const INITIAL_DOCS: DocumentMetadata[] = [
  { id: 'DOC-101', name: 'Merger Agreement v4.pdf', type: 'Contract', size: '2.4 MB', uploadedBy: 'Jane Doe', uploadedAt: '10:42 AM', region: Region.USA, classification: 'Privileged' },
  { id: 'DOC-102', name: 'Financial Audit 2023.xlsx', type: 'Financial', size: '8.1 MB', uploadedBy: 'System', uploadedAt: '09:15 AM', region: Region.USA, classification: 'Confidential' },
  { id: 'DOC-103', name: 'Employee Handbook.docx', type: 'Policy', size: '1.2 MB', uploadedBy: 'HR Bot', uploadedAt: 'Yesterday', region: Region.USA, classification: 'Internal' }
];

// Replaced Role-based map with Permission-based map
export const TAB_REQUIRED_PERMISSIONS: Record<string, string[]> = {
  'dashboard': [], // Public
  'platform-ops': ['manage_platform'],
  'enclave': ['manage_platform'], // Restricted
  'audit': ['read_all_audits'],

  // Tenant
  'governance': ['manage_tenant'],
  'tenant-admin': ['manage_users', 'manage_roles'],
  'org-blueprint': ['manage_users'],
  'integration-bridge': ['configure_bridge'],
  'identity': ['manage_users'],
  'backlog': ['manage_platform'],

  // Ops
  'conflict-check': ['check_conflicts', 'create_matter'],
  'reviews': ['review_work'],
  'workflow': ['design_workflow'],
  'vault': ['upload_document', 'read_assigned_matter'],
  'chat': ['create_matter', 'read_assigned_matter'],

  // Finance/Growth
  'growth': ['read_billing'],
  'system-settings': ['manage_platform'],
  'tenant-settings': ['manage_tenant'],
  'status': ['manage_platform']
};

// Default Permissions for Roles (Fallback/Mock)
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'TENANT_ADMIN': ['manage_tenant', 'manage_users', 'manage_roles', 'configure_bridge', 'read_all_audits', 'read_billing', 'manage_platform'],
  'INTERNAL_COUNSEL': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document'],
  'LEGAL_OPS': ['manage_users', 'design_workflow', 'read_billing', 'read_all_audits'],
  'GLOBAL_ADMIN': ['manage_platform', 'manage_tenant', 'read_all_audits'] // Just in case
};

export const TAB_PERMISSIONS: Record<string, UserRole[]> = {}; // Deprecated, keeping temporarily to avoid breakages if any imports remain
