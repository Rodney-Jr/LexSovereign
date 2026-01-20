
import { AppMode, DocumentMetadata, PrivilegeStatus, Region, RegulatoryRule, UserRole } from './types';

export const INITIAL_DOCS: DocumentMetadata[] = [
  {
    id: 'doc_001',
    name: 'Shareholder_Agreement_v2.pdf',
    matterId: 'MT-772',
    jurisdiction: 'Ghana',
    privilege: PrivilegeStatus.PRIVILEGED,
    region: Region.GHANA,
    encryption: 'BYOK',
    classification: 'Highly Sensitive',
    lastReviewed: '2024-05-15'
  },
  {
    id: 'doc_002',
    name: 'MSA_Standard_2024.docx',
    matterId: 'ENT-991',
    jurisdiction: 'EU-Germany',
    privilege: PrivilegeStatus.INTERNAL,
    region: Region.GERMANY,
    encryption: 'SYSTEM',
    classification: 'Confidential',
    lastReviewed: '2024-05-18'
  }
];

export const INITIAL_RULES: RegulatoryRule[] = [
  {
    id: 'RULE-GBA-001',
    name: 'Ghana Bar Association - Legal Advice Rule',
    authority: 'GBA Ethics Committee',
    triggerKeywords: ['advise you to', 'you should file', 'legal opinion'],
    blockThreshold: 0.85,
    description: 'Intercepts phrases that imply a definitive course of legal action for non-lawyer users.',
    isActive: true
  },
  {
    id: 'RULE-BOG-KYC',
    name: 'Bank of Ghana KYC Compliance',
    authority: 'BoG Financial Intelligence',
    triggerKeywords: ['identity verification', 'source of wealth', 'aml bypass'],
    blockThreshold: 0.9,
    description: 'Flags compliance risks related to identity and AML protocols.',
    isActive: true
  }
];

export const TAB_PERMISSIONS: Record<string, UserRole[]> = {
  // Public / Common
  'dashboard': Object.values(UserRole),
  'tenant-settings': [UserRole.TENANT_ADMIN, UserRole.DEPUTY_GC, UserRole.LEGAL_OPS, UserRole.GLOBAL_ADMIN], // Global Admin access for debugging
  'system-settings': [UserRole.GLOBAL_ADMIN],
  'status': [UserRole.GLOBAL_ADMIN],

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
  // Legal Operations
  'backlog': [UserRole.GLOBAL_ADMIN],
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
