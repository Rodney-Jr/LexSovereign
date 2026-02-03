import { Request } from 'express';

export interface AuthUser {
    id: string;
    email: string;
    name: string; // Added for UI display
    role: string;
    tenantId: string;
    permissions: string[];
    attributes?: Record<string, any>;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export enum IntegrationStatus {
    NOMINAL = 'Nominal',
    SYNCING = 'Syncing',
    ISOLATED = 'Isolated',
    DEGRADED = 'Degraded'
}

export enum EncapsulationLevel {
    DAS_PROXY = 'DAS Proxy (Scrubbed)',
    HSM_TUNNEL = 'HSM Signed (E2EE)',
    AIR_GAP = 'Local Enclave Only',
    STANDARD = 'Standard TLS'
}

export interface IntegrationBridge {
    id: string;
    name: string;
    category: 'Identity' | 'Messaging' | 'Storage' | 'AI' | 'Finance' | 'ERP' | 'Regulatory';
    provider: string;
    status: IntegrationStatus;
    encapsulation: EncapsulationLevel;
    priority: 'P0' | 'P1' | 'P2';
    lastActivity: string;
}

export enum AppMode {
    LAW_FIRM = 'LAW_FIRM',
    ENTERPRISE = 'ENTERPRISE'
}

export enum SaaSPlan {
    STANDARD = 'Standard',
    SOVEREIGN = 'Sovereign',
    ENCLAVE_EXCLUSIVE = 'Enclave Exclusive'
}

export enum UserRole {
    GLOBAL_ADMIN = 'Global Admin',
    TENANT_ADMIN = 'Tenant Admin', // GC
    DEPUTY_GC = 'Deputy GC',
    INTERNAL_COUNSEL = 'Legal Counsel',
    EXTERNAL_COUNSEL = 'External Counsel',
    LEGAL_OPS = 'Legal Ops',
    CLIENT = 'Client',
    EXECUTIVE_BOARD = 'Executive / Board',
    COMPLIANCE = 'Compliance Officer',
    FINANCE_BILLING = 'Finance / Billing'
}

export interface ChatbotConfig {
    id: string;
    botName: string;
    welcomeMessage: string;
    isEnabled: boolean;
    channels: {
        whatsapp: boolean;
        webWidget: boolean;
    };
    knowledgeBaseIds: string[];
    systemInstruction: string;
}

export interface KnowledgeArtifact {
    id: string;
    title: string;
    content: string;
    lastIndexed: string;
    category: 'Faq' | 'PracticeArea' | 'JurisdictionGuide' | 'OnboardingProcess';
}

export interface SystemPermission {
    dataVisibility: 'FULL' | 'SCRUBBED' | 'METADATA_ONLY';
    aiCapability: 'OVERSIGHT' | 'DRAFTING' | 'RESEARCH_ONLY' | 'ANALYTICS_ONLY';
    authorityLevel: 'PLATFORM' | 'TENANT' | 'MATTER' | 'READ_ONLY';
    canApproveSpend: boolean;
    canOverrideGuardrails: boolean;
    canSignDocuments: boolean;
    encryptionScope: 'GLOBAL' | 'REGIONAL' | 'MATTER_SPECIFIC';
    canManageSiloKeys: boolean;
    canManageTenantUsers: boolean;
}

export interface GlobalAdminIdentity {
    id: string;
    name: string;
    email: string;
    hardwareEnclaveId: string;
    mfaMethod: 'Deterministic Handshake' | 'ZK-Proof Hardware';
    status: 'Active' | 'Suspended';
    lastHandshake: string;
    accessLevel: 'PLATFORM_OWNER';
}

export enum PrivilegeStatus {
    PRIVILEGED = 'Privileged',
    WORK_PRODUCT = 'Work Product',
    INTERNAL = 'Internal Only',
    PUBLIC = 'Public'
}

export enum Region {
    GHANA = 'GH-ACC-1',
    GERMANY = 'DE-FRA-1',
    USA = 'US-EAS-1',
    SINGAPORE = 'SG-SIN-1'
}

export enum ReviewStatus {
    AI_DRAFTED = 'AI Drafted',
    SAFETY_VERIFIED = 'Safety Verified',
    COUNSEL_REVIEW = 'In Counsel Review',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

export interface UserCapabilities {
    role: UserRole;
    canViewPrivileged: boolean;
    canOverrideAI: boolean;
    canExportSovereign: boolean;
    assignedMatters: string[];
}

export interface ReviewArtifact {
    id: string;
    matterId: string;
    docId: string;
    title: string;
    status: ReviewStatus;
    urgency: 'Routine' | 'Urgent' | 'Critical';
    aiConfidence: number;
    piiCount: number;
    jurisdiction: string;
    assignedTo: UserRole;
}

export interface DocumentMetadata {
    id: string;
    name: string;
    matterId: string;
    jurisdiction: string;
    privilege: PrivilegeStatus;
    region: Region;
    encryption: 'BYOK' | 'SYSTEM';
    classification: 'Confidential' | 'Highly Sensitive' | 'Public';
    lastReviewed: string;
}

export interface LegalProfessional {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface Matter {
    id: string;
    name: string;
    client: string;
    type: string;
    internalCounsel: string;
    team?: LegalProfessional[];
    region: Region;
    status: 'Open' | 'Closed' | 'Archived';
    riskLevel: 'Low' | 'Medium' | 'High';
    description?: string;
    createdAt: string;
    attachedFiles?: string[];
}

export interface TimeEntry {
    id: string;
    matterId: string;
    lawyerId: string;
    lawyerName: string;
    activityType: 'Drafting' | 'Research' | 'Client Meeting' | 'Review' | 'Court Appearance';
    startTime: string;
    durationMinutes: number;
    description: string;
    isBillable: boolean;
    status: 'Draft' | 'Submitted' | 'Flagged' | 'Approved';
    aiSanityCheck?: string;
}

export interface RegulatoryRule {
    id: string;
    name: string;
    authority: string;
    triggerKeywords: string[];
    blockThreshold: number;
    description: string;
    isActive: boolean;
}

export interface AuditLogEntry {
    timestamp: string;
    actor: string;
    action: string;
    model: string;
    promptVersion: string;
    approvalToken: string;
    confidenceScore: number;
    status: 'PROCEEDED' | 'INTERCEPTED' | 'KILL_SWITCH';
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    verifiedBy?: string;
    isUPLTriggered?: boolean;
    references?: string[];
}

export interface IdentityProvider {
    id: string;
    name: string;
    type: string;
    status: string;
    lastSync: string;
    discoveryUrl: string;
}

export interface MobileSession {
    id: string;
    userId: string;
    platform: string;
    status: string;
    sanitizationLevel: string;
    expiresAt: string;
}

export enum EnclaveStatus {
    ISOLATED = 'Isolated',
    SYNCING = 'Syncing',
    MAINTENANCE = 'Maintenance'
}

export interface EnclaveNode {
    id: string;
    status: EnclaveStatus;
    cpuLoad: number;
    gpuLoad: number;
    temp: number;
    uptime: string;
}

export interface LocalModel {
    id: string;
    name: string;
    version: string;
    hash: string;
    lastLoaded: string;
    parameterCount: string;
    quantization: string;
}

export interface PredictiveRisk {
    id: string;
    matterId: string;
    type: string;
    probability: number;
    impact: string;
    description: string;
    billingEntry?: BillingEntry;
}

export interface BillingEntry {
    id: string;
    matterId: string;
    lawyer: string;
    hours: number;
    rate: number;
    description: string;
    status: 'CLEAN' | 'FLAGGED';
    auditReason?: string;
}

export interface TenantMetadata {
    id: string;
    name: string;
    plan: SaaSPlan;
    primaryRegion: Region;
    sovereignCredits: number;
    activeMatters: number;
    dataGravity: string;
}

export interface TenantUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastActive: string;
    mfaEnabled: boolean;
}

export interface Clause {
    clause_key: string;
    clause_title: string;
    clause_text: string;
    clause_type: 'locked' | 'variable' | 'optional';
    order_index?: number;
}
