

export interface Policy {
  id: string;
  name: string;
  description?: string;
  effect: 'ALLOW' | 'DENY';
  resource: string;
  action: string;
  condition?: string;
  priority: number;
}

export interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string;
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
  SOLO = 'Solo',
  STARTER = 'Starter',
  STANDARD = 'Standard',
  SOVEREIGN = 'Sovereign',
  ENCLAVE = 'Enclave',
  ENCLAVE_EXCLUSIVE = 'Enclave Exclusive',
  PROFESSIONAL = 'Professional',
  INSTITUTIONAL = 'Institutional'
}

export enum UserRole {
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  PARTNER = 'PARTNER',
  SENIOR_COUNSEL = 'SENIOR_COUNSEL',
  INTERNAL_COUNSEL = 'INTERNAL_COUNSEL',
  JUNIOR_ASSOCIATE = 'JUNIOR_ASSOCIATE',
  EXTERNAL_COUNSEL = 'EXTERNAL_COUNSEL',
  LEGAL_OPS = 'LEGAL_OPS',
  COMPLIANCE = 'COMPLIANCE',
  FINANCE_BILLING = 'FINANCE_BILLING',
  CLIENT = 'CLIENT',
  EXECUTIVE_BOARD = 'EXECUTIVE_BOARD',
  DEPUTY_GC = 'DEPUTY_GC',
  // New Roles for Approval Workflow
  OWNER = 'OWNER',
  PARALEGAL = 'PARALEGAL',
  AUDITOR = 'AUDITOR',
  CLERK = 'CLERK',
  ADMIN_MANAGER = 'ADMIN_MANAGER',
  MANAGING_PARTNER = 'MANAGING_PARTNER'
}

export interface SessionData {
  role: string;
  userId: string;
  userName?: string;
  tenantId: string;
  department?: TenantDepartment;
  permissions: Permission[];
  mode?: AppMode;
  token?: string;
  mfaEnabled?: boolean;
  enabledModules?: string[];
  allowedNavItems?: string[];
  allowedQuickActions?: string[];
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

export interface FieldIntakeDocument {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'PENDING' | 'ATTACHED' | 'REJECTED';
  matterId?: string;
  category: 'Registrar' | 'Court' | 'Corporate' | 'Other';
  previewUrl: string;
  notes?: string;
}

export interface ExpenseEntry {
  id: string;
  category: 'Filing Fees' | 'Transportation' | 'Office Supplies' | 'Utilities' | 'Other';
  amount: number;
  currency: string;
  date: string;
  description: string;
  recipient: string;
  submittedBy: string;
  approvedBy?: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ImprestAccount {
  id: string;
  staffId: string;
  staffName: string;
  balance: number;
  currency: string;
  lastTopUp: string;
  limit: number;
}

export interface LeaveRecord {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  type: 'Vacation' | 'Sick' | 'CLE' | 'Maternity/Paternity' | 'Other';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface HRArtifact {
  id: string;
  userId: string;
  type: 'Contract' | 'Performance' | 'Salary' | 'Disciplinary' | 'Other';
  title: string;
  contentHash: string;
  uploadedAt: string;
  encryptionKeyId: string;
  classification: 'Highly Sensitive';
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
  PRIMARY = 'SOV-PR-1',
  SECONDARY = 'SOV-SC-1',
  GLOBAL = 'GL-ALL-1',
  USA = 'US-EAS-1'
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
  matterId?: string; // made optional as initial docs don't have it
  jurisdiction?: string; // made optional
  privilege?: PrivilegeStatus; // made optional
  region?: Region; // made optional
  encryption?: 'BYOK' | 'SYSTEM' | 'DAS'; // made optional
  classification: 'Confidential' | 'Highly Sensitive' | 'Public' | 'Internal' | 'Privileged'; // added Internal/Privileged to allow constants usage, or fix constants
  lastReviewed?: string; // made optional
  attributes?: Record<string, any>;

  // New UI fields
  type?: string;
  size?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  content?: string; // Optional content for creation/preview
  status?: string;

  // Approval Workflow Fields
  creatorId?: string;
  approvalStatus?: 'DRAFT' | 'REVIEW' | 'APPROVED';

}

export interface LegalProfessional {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: string;
  taxId?: string;
  type: 'CORPORATE' | 'INDIVIDUAL';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  matters?: Matter[];
  _count?: {
    matters: number;
  };
}

export interface Matter {
  id: string;
  name: string;
  client: string;
  type: string; // Legacy type mapping
  matterTypeId?: string;
  workflowStateId?: string;
  internalCounsel: string;
  departmentId?: string;
  team?: LegalProfessional[];
  region: Region;
  status: 'Open' | 'Closed' | 'Archived' | string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description?: string;
  createdAt: string;
  updatedAt?: string;
  attachedFiles?: string[];
  complexityWeight?: number;
  conflictStatus?: 'CLEAN' | 'COLLISION' | 'NOT_CHECKED';
  conflictProof?: string;
  attributes?: Record<string, any>;

  // Relations (optional for client-side)
  matterType?: MatterType;
  workflowState?: WorkflowState;
  tasks?: Task[];
  contractMetadata?: ContractMetadata;
  caseMetadata?: CaseMetadata;
  aiRiskAnalyses?: AIRiskAnalysis[];
}

export interface MatterType {
  id: string;
  name: string;
  description?: string;
  category: 'CONTRACT' | 'CASE' | 'ADVISORY';
  defaultWorkflowId?: string;
  tenantId: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  matterTypeId: string;
  isActive: boolean;
  states?: WorkflowState[];
}

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
  order: number;
  workflowId: string;
  canAssignTasks: boolean;
  isApprovalRequired: boolean;
  isInitial: boolean;
  isFinal: boolean;
  color?: string;
}

export interface WorkflowTransition {
  id: string;
  fromStateId: string;
  toStateId: string;
  requiredRole?: string;
  condition?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  assigneeId?: string;
  matterId: string;
  workflowStateId?: string;
  isAutoGenerated: boolean;
  createdAt: string;
}

export interface ContractMetadata {
  id: string;
  matterId: string;
  contractValue?: number;
  currency: string;
  counterpartyName?: string;
  effectiveDate?: string;
  renewalDate?: string;
  expiryDate?: string;
  alertTriggered: boolean;
}

export interface CaseMetadata {
  id: string;
  matterId: string;
  jurisdiction?: string;
  caseNumber?: string;
  courtName?: string;
  judgeName?: string;
  filedDate?: string;
}

export interface AIRiskAnalysis {
  id: string;
  matterId: string;
  riskScore: number;
  summary?: string;
  identifiedClauses?: any;
  confidenceScore: number;
  isValidated: boolean;
  validatorId?: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  matterId: string;
  type: 'STATE_CHANGE' | 'TASK' | 'DOCUMENT' | 'MESSAGE' | 'DEADLINE' | 'AI_INSIGHT';
  actorId?: string;
  details: string;
  metadata?: any;
  createdAt: string;
}

export interface TenantDepartment {
  id: string;
  name: string;
  tenantId: string;
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
  region?: Region;
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
  licenseAttestation?: string;
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
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  primaryRegion: Region;
  sovereignCredits: number;
  activeMatters: number;
  userCount: number;
  dataGravity: string;
}

export interface BrandingProfile {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFont: string;
  headerText?: string;
  footerText?: string;
  coverPageEnabled: boolean;
  watermarkText?: string;
  version: number;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum Department {
  LEGAL_OPERATIONS = 'Legal Operations',
  INVESTIGATION = 'Investigation',
  PROSECUTION = 'Prosecution',
  CORPORATE = 'Corporate',
  FINANCE = 'Finance',
  HR = 'HR',
  EXECUTIVE = 'Executive'
}

// Re-exporting interfaces with department field
export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department; // Keeping enum here
  lastActive: string;
  mfaEnabled: boolean;
  maxWeeklyHours?: number;
  roleSeniority?: number;
  jurisdictionPins?: string[];
  credentials?: any[];
  attributes?: Record<string, any>;
}

