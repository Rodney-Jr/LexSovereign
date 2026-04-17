
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
  'global-governance': ['MANAGE:PLATFORM'],
  'platform-ops': ['MANAGE:PLATFORM'],
  'pricing-calib': ['MANAGE:PLATFORM'], // Global Admin Pricing
  'enclave': ['MANAGE:PLATFORM'], // Restricted
  'audit': ['VIEW_STATS:TENANT'],
  
  // Tenant
  'analytics': ['VIEW_STATS:TENANT'],
  'tenant-governance': ['MANAGE:TENANT_SETTINGS'],
  'tenant-admin': ['MANAGE:USER', 'MANAGE:ROLE'],
  'org-blueprint': ['MANAGE:USER'],
  'integration-bridge': ['MANAGE:TENANT_SETTINGS'],
  'identity': ['MANAGE:USER'],
  'backlog': ['MANAGE:PLATFORM'],

  // Ops
  'conflict-check': ['CHECK:CONFLICTS'], // Legacy ID fallback if needed
  'reviews': ['REVIEW:WORK'],
  'workflow': ['MANAGE:WORKFLOW'],
  'vault': ['UPLOAD:DOCUMENT', 'VIEW:MATTER'],
  'drafting': ['UPLOAD:DOCUMENT', 'CREATE:DRAFT'],
  'marketplace': ['VIEW:MATTER'],
  'chat': ['USE:CHAT'],
  'clm-center': ['MANAGE:WORKFLOW', 'REVIEW:WORK'],
  'case-center': ['CREATE:MATTER', 'REVIEW:WORK'],
  'clients': ['VIEW:CLIENT'],

  // Finance/Growth
  'growth': ['VIEW_BILLING:TENANT'],
  'billing': ['VIEW_BILLING:TENANT'],
  'accounting-hub': ['ACCESS:ACCOUNTING'],
  'capacity': ['MANAGE:USER'],
  'system-settings': ['ACCESS:INFRASTRUCTURE'],
  'tenant-settings': ['VIEW:TENANT_SETTINGS', 'MANAGE:TENANT_SETTINGS'],
  'status': ['ACCESS:ROADMAP'],
  'analysis': ['CREATE:DRAFT', 'REVIEW:WORK'],
  'client-portal': ['ACCESS:CLIENT_PORTAL'],
  'field-intake': ['UPLOAD:FIELD_INTAKE', 'VIEW:MATTER'],
  'hr-workbench': ['ACCESS:HR'],
  'expense-tracker': ['MANAGE:EXPENSES'],
  'asset-tracker': ['MANAGE:EXPENSES'],
  'finance-ops': ['MANAGE:EXPENSES', 'VIEW_BILLING:TENANT'],
};

// Default Permissions for Roles (Fallback/Mock)
// Default Permissions for Roles (Fallback/Mock)
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  'TENANT_ADMIN': ['MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'MANAGE:ROLE', 'MANAGE_UI:TENANT', 'MANAGE:WORKFLOW', 'CREATE:DRAFT', 'UPLOAD:DOCUMENT', 'ACCESS:HR', 'ACCESS:ACCOUNTING', 'ACCESS:ROADMAP', 'ACCESS:INFRASTRUCTURE', 'VIEW:TRIAL', 'CREATE:MATTER', 'REVIEW:WORK', 'CHECK:CONFLICTS', 'VIEW:CLIENT', 'VIEW:MATTER', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'APPROVE:DOCUMENT', 'EXPORT:DOCUMENT', 'EXECUTE:AI', 'USE:CHAT', 'VIEW:CONFIDENTIAL', 'MANAGE:BUDGET', 'MANAGE:EXPENSES', 'VIEW_BILLING:TENANT'],
  'MANAGING_PARTNER': ['MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'VIEW_BILLING:TENANT', 'CREATE:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'VIEW:MATTER', 'MANAGE:WORKFLOW', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'EXECUTE:AI', 'USE:CHAT', 'VIEW:CONFIDENTIAL', 'MANAGE:BUDGET', 'APPROVE:SPEND', 'MANAGE:EXPENSES', 'ACCESS:HR', 'ACCESS:ACCOUNTING', 'VIEW:CLIENT'],
  'INTERNAL_COUNSEL': ['CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'USE:CHAT'],
  'GLOBAL_ADMIN': ['MANAGE:PLATFORM', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'USE:CHAT', 'CREATE:DRAFT', 'UPLOAD:DOCUMENT'],
  'DEPUTY_GC': ['MANAGE:USER', 'VIEW_STATS:TENANT', 'CREATE:MATTER', 'REVIEW:WORK', 'CHECK:CONFLICTS', 'VIEW:MATTER', 'MANAGE:ROLE', 'CREATE:DRAFT', 'APPROVE:DOCUMENT', 'VIEW_BILLING:TENANT', 'MANAGE:WORKFLOW', 'USE:CHAT'],
  'EXTERNAL_COUNSEL': ['VIEW:MATTER', 'UPLOAD:DOCUMENT', 'CREATE:MATTER', 'CREATE:DRAFT', 'USE:CHAT'],
  'CLIENT': ['VIEW:MATTER', 'ACCESS:CLIENT_PORTAL', 'EXPORT:DOCUMENT'],
  'EXECUTIVE_BOARD': ['VIEW_STATS:TENANT', 'VIEW_BILLING:TENANT', 'USE:CHAT'],
  'COMPLIANCE': ['VIEW_STATS:TENANT', 'MANAGE:TENANT_SETTINGS', 'USE:CHAT'],
  'FINANCE_BILLING': ['VIEW_BILLING:TENANT'],
  'PARTNER': ['CREATE:MATTER', 'VIEW:MATTER', 'VIEW_STATS:TENANT', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'APPROVE:DOCUMENT', 'EXPORT:DOCUMENT', 'VIEW_BILLING:TENANT', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'MANAGE:WORKFLOW', 'USE:CHAT', 'MANAGE:BUDGET'],
  'SENIOR_COUNSEL': ['CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'USE:CHAT', 'VIEW_BILLING:TENANT'],
  'JUNIOR_ASSOCIATE': ['VIEW:MATTER', 'CHECK:CONFLICTS', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'CREATE:MATTER', 'USE:CHAT'],


  // Approval Workflow Permissions
  'OWNER': ['CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'APPROVE:DOCUMENT', 'EXPORT:DOCUMENT', 'MANAGE:PLATFORM', 'MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE', 'USE:CHAT', 'MANAGE:BUDGET', 'ACCESS:HR', 'ACCESS:ACCOUNTING'],
  'PARALEGAL': ['CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'USE:CHAT'],
  'AUDITOR': ['VIEW_STATS:TENANT', 'VIEW:MATTER'],
  'CLERK': ['UPLOAD:FIELD_INTAKE', 'USE:CHAT', 'VIEW:MATTER'],
  'ADMIN_MANAGER': ['VIEW_BILLING:TENANT', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'MANAGE:ROLE', 'CHECK:CONFLICTS', 'MANAGE:EXPENSES', 'ACCESS:HR', 'ACCESS:ACCOUNTING'],
  // Demo tenant roles - Law Firm (Apex Law Partners)
  'FINANCE_MANAGER': ['VIEW_BILLING:TENANT', 'MANAGE:EXPENSES', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'VIEW_STATS:TENANT'],
  'SENIOR_ASSOCIATE': ['CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'USE:CHAT', 'VIEW_BILLING:TENANT'],
  // Demo tenant roles - Enterprise (Global Logistics Corp)
  'GENERAL_COUNSEL': ['MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE', 'VIEW_STATS:TENANT', 'VIEW_BILLING:TENANT', 'CREATE:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'VIEW:MATTER', 'MANAGE:WORKFLOW', 'CREATE:DRAFT', 'EDIT:DRAFT', 'APPROVE:DOCUMENT', 'USE:CHAT', 'MANAGE:EXPENSES', 'VIEW_STATS:TENANT'],
  'CONTRACT_MANAGER': ['CREATE:MATTER', 'VIEW:MATTER', 'MANAGE:WORKFLOW', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'USE:CHAT', 'VIEW_BILLING:TENANT', 'MANAGE:EXPENSES'],

  'COMPLIANCE_OFFICER': ['VIEW_STATS:TENANT', 'MANAGE:TENANT_SETTINGS', 'REVIEW:WORK', 'VIEW:MATTER', 'UPLOAD:DOCUMENT', 'USE:CHAT'],
  'LEGAL_OPS': ['MANAGE:USER', 'MANAGE:WORKFLOW', 'VIEW_BILLING:TENANT', 'VIEW_STATS:TENANT', 'CREATE:MATTER', 'UPLOAD:DOCUMENT', 'VIEW:MATTER', 'CREATE:DRAFT', 'CHECK:CONFLICTS', 'USE:CHAT', 'MANAGE:EXPENSES', 'VIEW_STATS:TENANT']
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

export const ALL_QUICK_ACTIONS = [
  { id: 'quick_draft', label: 'Quick Draft', icon: 'Sparkles' },
  { id: 'incept_matter', label: 'Incept Matter', icon: 'Briefcase' },
  { id: 'request_leave', label: 'Request Leave', icon: 'Calendar' },
];

export const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'vault', label: 'Document Vault', icon: 'FileLock' },
  { id: 'drafting', label: 'Drafting Studio', icon: 'PenTool' },
  { id: 'conflict-check', label: 'Conflict Search', icon: 'ShieldCheck' },
  { id: 'case-center', label: 'Case Center', icon: 'Gavel' },
  { id: 'clm-center', label: 'CLM Center', icon: 'FileSignature' },
  { id: 'accounting-hub', label: 'Accounting Hub', icon: 'Banknote' },
  { id: 'hr-workbench', label: 'HR Workbench', icon: 'Users' },
  { id: 'analytics', label: 'Analytics', icon: 'Activity' },
  { id: 'tenant-settings', label: 'Tenant Settings', icon: 'Settings' },
  { id: 'clients', label: 'Client Directory', icon: 'Users' },
  { id: 'identity', label: 'Access Governance', icon: 'UserPlus' },
  { id: 'audit', label: 'Audit Logs', icon: 'Fingerprint' },
  { id: 'dossier', label: 'Sovereign Profile', icon: 'User' },
];
