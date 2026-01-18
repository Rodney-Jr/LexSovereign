
import { AppMode, DocumentMetadata, PrivilegeStatus, Region, RegulatoryRule } from './types';

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
