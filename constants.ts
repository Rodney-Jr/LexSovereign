
import { RegulatoryRule, DocumentMetadata, AppMode, UserRole, Matter, Region } from './types';


export const INITIAL_RULES: RegulatoryRule[] = [
  { id: 'REG-001', name: 'GDPR Data Sovereignty', description: 'Ensure EU user data remains within EU enclaves.', region: Region.GLOBAL, isActive: true, authority: 'EU Commission', triggerKeywords: ['personal data', 'eu citizen'], blockThreshold: 0.8 },
  { id: 'REG-002', name: 'CCPA Consumer Rights', description: 'Enforce right to deletion for CA residents.', region: Region.USA, isActive: true, authority: 'California State', triggerKeywords: ['california', 'consumer'], blockThreshold: 0.7 },
  { id: 'REG-003', name: 'Banking Secrecy Act', description: 'Flag transactions over $10k for review.', region: Region.USA, isActive: false, authority: 'FinCEN', triggerKeywords: ['transaction', 'structuring'], blockThreshold: 0.9 }
];

export const INITIAL_DOCS: DocumentMetadata[] = [
  { id: 'DOC-101', name: 'Merger Agreement v4.pdf', type: 'Contract', size: '2.4 MB', uploadedBy: 'Lead Counsel', uploadedAt: '10:42 AM', region: Region.USA, classification: 'Privileged' },
  { id: 'DOC-102', name: 'Financial Audit 2023.xlsx', type: 'Financial', size: '8.1 MB', uploadedBy: 'System', uploadedAt: '09:15 AM', region: Region.USA, classification: 'Confidential' },
  { id: 'DOC-103', name: 'Employee Handbook.docx', type: 'Policy', size: '1.2 MB', uploadedBy: 'Operations', uploadedAt: 'Yesterday', region: Region.USA, classification: 'Internal' }
];

// Replaced Role-based map with Permission-based map
export const TAB_REQUIRED_PERMISSIONS: Record<string, string[]> = {
  'dashboard': [], // Public
  'global-governance': ['manage_platform'],
  'platform-ops': ['manage_platform'],
  'pricing-calib': ['manage_platform'], // Global Admin Pricing
  'enclave': ['manage_platform'], // Restricted
  'audit': ['read_all_audits'],

  // Tenant
  'analytics': ['read_analytics'],
  'tenant-governance': ['manage_tenant'],
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
  'drafting': ['upload_document', 'create_draft'],
  'marketplace': ['read_assigned_matter'],
  'chat': ['use_legal_chat'],
  'clm-center': ['design_workflow', 'review_work'],
  'case-center': ['create_matter', 'review_work'],

  // Finance/Growth
  'growth': ['read_billing'],
  'capacity': ['manage_users'],
  'system-settings': ['manage_platform'],
  'tenant-settings': ['manage_tenant'],
  'status': ['manage_platform'],
  'analysis': ['create_draft', 'review_work'],
  'client-portal': ['client_portal_access']
};

// Default Permissions for Roles (Fallback/Mock)
// Default Permissions for Roles (Fallback/Mock)
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'TENANT_ADMIN': ['manage_tenant', 'read_analytics', 'manage_users', 'manage_roles', 'configure_bridge', 'read_all_audits', 'read_billing', 'create_matter', 'check_conflicts', 'review_work', 'upload_document', 'read_assigned_matter', 'design_workflow', 'create_draft', 'edit_draft', 'submit_review', 'use_legal_chat'],
  'INTERNAL_COUNSEL': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'use_legal_chat'],
  'LEGAL_OPS': ['manage_users', 'design_workflow', 'read_billing', 'read_all_audits', 'create_matter', 'upload_document', 'read_assigned_matter', 'create_draft', 'check_conflicts', 'use_legal_chat'],
  'GLOBAL_ADMIN': ['manage_platform', 'manage_tenant', 'read_all_audits', 'use_legal_chat'],
  'DEPUTY_GC': ['manage_users', 'read_all_audits', 'create_matter', 'review_work', 'check_conflicts', 'read_assigned_matter', 'manage_roles', 'create_draft', 'approve_document', 'read_billing', 'design_workflow', 'use_legal_chat'],
  'EXTERNAL_COUNSEL': ['read_assigned_matter', 'upload_document', 'create_matter', 'create_draft', 'use_legal_chat'],
  'CLIENT': ['read_assigned_matter', 'client_portal_access'],
  'EXECUTIVE_BOARD': ['read_all_audits', 'read_billing', 'use_legal_chat'],
  'COMPLIANCE': ['read_all_audits', 'manage_tenant', 'use_legal_chat'],
  'FINANCE_BILLING': ['read_billing'],
  'PARTNER': ['create_matter', 'read_assigned_matter', 'read_analytics', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'approve_document', 'export_final', 'read_billing', 'read_all_audits', 'manage_users', 'design_workflow', 'use_legal_chat'],
  'SENIOR_COUNSEL': ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'read_billing', 'use_legal_chat'],
  'JUNIOR_ASSOCIATE': ['read_assigned_matter', 'check_conflicts', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'create_matter', 'use_legal_chat'],

  // Approval Workflow Permissions
  'OWNER': ['create_draft', 'edit_draft', 'submit_review', 'approve_document', 'export_final', 'manage_platform', 'use_legal_chat'],
  'PARALEGAL': ['create_draft', 'edit_draft', 'submit_review', 'use_legal_chat'],
  'AUDITOR': ['read_all_audits', 'read_assigned_matter']
};


export const INITIAL_MATTERS: Matter[] = [
  {
    id: 'MAT-GEN-001',
    name: 'Standard Corporate Restructuring',
    client: 'Strategic Partners Group',
    type: 'Corporate',
    internalCounsel: 'Senior Counsel',
    region: Region.PRIMARY,
    status: 'Open',
    riskLevel: 'Medium',
    createdAt: '2024-05-01'
  }
];
