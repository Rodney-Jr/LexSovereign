import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { TenantService } from '../services/TenantService';

const prisma = new PrismaClient();

const PERMISSIONS = [
    // Platform
    { id: 'manage_platform', description: 'Full platform control', resource: 'PLATFORM', action: 'MANAGE' },
    { id: 'create_tenant', description: 'Create new tenants', resource: 'TENANT', action: 'CREATE' },
    { id: 'configure_bridge', description: 'Configure integration bridges', resource: 'BRIDGE', action: 'CONFIGURE' },
    { id: 'read_all_audits', description: 'Read system-wide audit logs', resource: 'AUDIT', action: 'READ_ALL' },

    // Leadership
    { id: 'manage_tenant', description: 'Manage tenant settings', resource: 'TENANT', action: 'MANAGE' },
    { id: 'manage_users', description: 'Manage users and roles', resource: 'USER', action: 'MANAGE' },
    { id: 'manage_roles', description: 'Create and edit custom roles', resource: 'ROLE', action: 'MANAGE' },
    { id: 'approve_matter_high_risk', description: 'Approve high risk matters', resource: 'MATTER', action: 'APPROVE_HIGH_RISK' },
    { id: 'approve_spend', description: 'Approve external spend', resource: 'FINANCE', action: 'APPROVE' },

    // Practice
    { id: 'sign_document', description: 'Sign legal documents', resource: 'DOCUMENT', action: 'SIGN' },
    { id: 'close_matter', description: 'Close/Archive matters', resource: 'MATTER', action: 'CLOSE' },
    { id: 'create_matter', description: 'Create new matters', resource: 'MATTER', action: 'CREATE' },
    { id: 'edit_document', description: 'Edit document content', resource: 'DOCUMENT', action: 'EDIT' },
    { id: 'override_ai', description: 'Override AI safety checks', resource: 'AI', action: 'OVERRIDE' },
    { id: 'draft_document', description: 'Draft documents', resource: 'DOCUMENT', action: 'DRAFT' },

    // Ops & Compliance
    { id: 'design_workflow', description: 'Design workflows', resource: 'WORKFLOW', action: 'DESIGN' },
    { id: 'upload_document', description: 'Upload documents', resource: 'DOCUMENT', action: 'UPLOAD' },
    { id: 'read_billing', description: 'View billing dashboards', resource: 'BILLING', action: 'READ' },
    { id: 'configure_rre', description: 'Configure Regulatory Rules Engine', resource: 'RRE', action: 'CONFIGURE' },
    { id: 'configure_scrub', description: 'Configure PII scrubbing', resource: 'SCRUB', action: 'CONFIGURE' },

    // Banking Specific
    { id: 'approve_kyc', description: 'Approve KYC applications', resource: 'COMPLIANCE', action: 'APPROVE_KYC' },
    { id: 'report_suspicious', description: 'File Suspicious Activity Reports', resource: 'COMPLIANCE', action: 'REPORT_SAR' },
    { id: 'edit_policy', description: 'Edit internal banking policies', resource: 'POLICY', action: 'EDIT' },
    { id: 'verify_collateral', description: 'Verify loan collateral', resource: 'FINANCE', action: 'VERIFY' },
    { id: 'audit_access', description: 'Audit data access logs', resource: 'AUDIT', action: 'AUDIT_ACCESS' },

    // Insurance Specific
    { id: 'assess_coverage', description: 'Assess insurance coverage', resource: 'CLAIM', action: 'ASSESS' },
    { id: 'approve_settlement', description: 'Approve claim settlements', resource: 'CLAIM', action: 'APPROVE_SETTLEMENT' },
    { id: 'manage_outside_counsel', description: 'Manage external panel counsel', resource: 'VENDOR', action: 'MANAGE' },
    { id: 'assign_counsel', description: 'Assign counsel to litigation', resource: 'LITIGATION', action: 'ASSIGN' },
    { id: 'review_policy_language', description: 'Review policy wording', resource: 'POLICY', action: 'REVIEW' },

    // General Industry
    { id: 'review_work', description: 'Review associate work', resource: 'WORK', action: 'REVIEW' },
    { id: 'organize_files', description: 'Organize file systems', resource: 'FILE', action: 'ORGANIZE' },
    { id: 'execute_research', description: 'Execute legal research', resource: 'RESEARCH', action: 'EXECUTE' },
    { id: 'check_conflicts', description: 'Perform conflict checks', resource: 'CONFLICT', action: 'CHECK' },
    { id: 'read_assigned_matter', description: 'Read matters assigned to user', resource: 'MATTER', action: 'READ' },

    // Intellectual Property
    { id: 'manage_patent_portfolio', description: 'Manage patent application cycles', resource: 'IP', action: 'MANAGE' },
    { id: 'conduct_prior_art_research', description: 'Perform technical prior art research', resource: 'RESEARCH', action: 'PRIOR_ART' },

    // Maritime Law
    { id: 'verify_vessel_registry', description: 'Verify vessel ownership and registration', resource: 'MARITIME', action: 'VERIFY' },
    { id: 'manage_admiralty_claims', description: 'Process maritime liens and arrests', resource: 'CLAIM', action: 'ADMIRALTY' },

    // Real Estate
    { id: 'manage_conveyancing', description: 'Manage land transfer workflows', resource: 'PROPERTY', action: 'CONVEYANCE' },
    { id: 'verify_title_deeds', description: 'Verify land registry documentation', resource: 'PROPERTY', action: 'VERIFY' },

    // Public Sector
    { id: 'draft_legislation', description: 'Draft legislative instruments', resource: 'LEGAL', action: 'DRAFT_LAW' },
    { id: 'manage_public_disclosure', description: 'Manage FOI and public disclosure requests', resource: 'GOVERNANCE', action: 'DISCLOSE' },

    // Approval & Portal
    { id: 'create_draft', description: 'Create document drafts', resource: 'DOCUMENT', action: 'CREATE_DRAFT' },
    { id: 'edit_draft', description: 'Edit existing drafts', resource: 'DOCUMENT', action: 'EDIT_DRAFT' },
    { id: 'approve_document', description: 'Approve finalized documents', resource: 'DOCUMENT', action: 'APPROVE' },
    { id: 'submit_review', description: 'Submit work for review', resource: 'WORK', action: 'SUBMIT' },
    { id: 'export_final', description: 'Export finalized documents', resource: 'DOCUMENT', action: 'EXPORT' },
    { id: 'client_portal_access', description: 'Access to client portal', resource: 'PORTAL', action: 'ACCESS' },
];

const ROLES = [
    { name: 'GLOBAL_ADMIN', permissions: ['manage_platform', 'manage_tenant', 'read_all_audits'] },
    { name: 'TENANT_ADMIN', permissions: ['manage_tenant', 'manage_users', 'manage_roles', 'configure_bridge', 'read_all_audits', 'read_billing', 'create_matter', 'check_conflicts', 'review_work', 'upload_document', 'read_assigned_matter', 'design_workflow', 'create_draft', 'edit_draft', 'submit_review'] },
    { name: 'PARTNER', permissions: ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'approve_document', 'export_final', 'read_billing', 'read_all_audits', 'manage_users', 'design_workflow'] },
    { name: 'SENIOR_COUNSEL', permissions: ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'read_billing'] },
    { name: 'INTERNAL_COUNSEL', permissions: ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document', 'create_draft', 'edit_draft'] },
    { name: 'JUNIOR_ASSOCIATE', permissions: ['read_assigned_matter', 'check_conflicts', 'upload_document', 'create_draft', 'edit_draft', 'submit_review', 'create_matter'] },
    { name: 'LEGAL_OPS', permissions: ['manage_users', 'design_workflow', 'read_billing', 'read_all_audits', 'create_matter', 'upload_document', 'read_assigned_matter', 'create_draft', 'check_conflicts'] },
    { name: 'COMPLIANCE', permissions: ['read_all_audits', 'manage_tenant'] },
    { name: 'FINANCE_BILLING', permissions: ['read_billing'] },
    { name: 'EXTERNAL_COUNSEL', permissions: ['read_assigned_matter', 'upload_document', 'create_matter', 'create_draft'] },
    { name: 'DEPUTY_GC', permissions: ['manage_users', 'read_all_audits', 'create_matter', 'review_work', 'check_conflicts', 'read_assigned_matter', 'manage_roles', 'create_draft', 'approve_document', 'read_billing', 'design_workflow'] },
    { name: 'CLIENT', permissions: ['read_assigned_matter', 'client_portal_access'] },
    { name: 'EXECUTIVE_BOARD', permissions: ['read_all_audits', 'read_billing'] },
    { name: 'OWNER', permissions: ['create_draft', 'edit_draft', 'submit_review', 'approve_document', 'export_final', 'manage_platform'] },
    { name: 'PARALEGAL', permissions: ['create_draft', 'edit_draft', 'submit_review'] },
    { name: 'AUDITOR', permissions: ['read_all_audits', 'read_assigned_matter'] }
];

async function main() {
    console.log('🌱 Bulk Seeding Permissions...');
    await prisma.permission.createMany({
        data: PERMISSIONS,
        skipDuplicates: true
    });
    console.log('✅ Permissions seeded.');

    console.log('🌱 Seeding System Roles...');
    for (const r of ROLES) {
        // Check if system role exists
        let role = await prisma.role.findFirst({
            where: { name: r.name, isSystem: true, tenantId: null }
        });

        if (!role) {
            console.log(`   creating system role: ${r.name}`);
            role = await prisma.role.create({
                data: {
                    name: r.name,
                    description: `System Role: ${r.name}`,
                    isSystem: true,
                    permissions: {
                        connect: r.permissions.map(id => ({ id }))
                    }
                }
            });
        }
    }
    console.log('✅ System Roles seeded.');

    // Tenant & User Seeding using Service
    console.log('🌱 Provisioning Default Tenant via Service...');

    // Check if admin user already exists to prevent duplicate seeding errors
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@nomosdesk.com' } });

    let tenantId;
    let counselId;

    if (!existingAdmin) {
        const result = await TenantService.provisionTenant({
            name: 'NomosDesk Demo',
            adminEmail: 'admin@nomosdesk.com',
            adminName: 'Sovereign Admin',
            adminPassword: 'password123',
            plan: 'ENTERPRISE',
            region: 'GH_ACC_1',
            appMode: 'LAW_FIRM'
        });

        tenantId = result.tenantId;

        // Manually update ID to keep it stable for seeding references if needed, 
        // OR just rely on the returned ID.
        // For seeding stability, we might want to enforce the ID, but TenantService generates random UUID.
        // Let's just use the returned ID for subsequent relations.
        console.log(`✅ Provisioned Tenant: ${result.tenantId}`);
        console.log(`✅ Admin Credentials: admin@nomosdesk.com / password123`);

        console.log('🌱 Updating Admin User details...');
        const globalAdminRole = await prisma.role.findFirst({ where: { name: 'GLOBAL_ADMIN', isSystem: true, tenantId: null } });
        if (!globalAdminRole) {
            console.error('❌ Critical: GLOBAL_ADMIN role not found after seeding!');
            throw new Error('GLOBAL_ADMIN role missing.');
        }

        await prisma.user.update({
            where: { id: result.adminId },
            data: {
                roleString: 'GLOBAL_ADMIN',
                role: { connect: { id: globalAdminRole.id } },
                jurisdictionPins: ['GH_ACC_1'],
                credentials: [{ type: 'SYSTEM_ADMIN', id: 'SA-001' }]
            }
        });

        // Create secondary user (Internal Counsel)
        // Provisioner doesn't create secondary users.
        const counselRole = await prisma.role.findFirst({
            where: { name: 'INTERNAL_COUNSEL', tenantId: result.tenantId }
        });

        const counsel = await prisma.user.create({
            data: {
                email: 'counsel@nomosdesk.com',
                passwordHash: await bcrypt.hash('password123', 10),
                name: 'Internal Counsel',
                roleId: counselRole?.id,
                roleString: 'INTERNAL_COUNSEL',
                region: 'GH_ACC_1',
                tenantId: result.tenantId
            }
        });
        counselId = counsel.id;
        tenantId = result.tenantId; // Ensure available for scope

    } else {
        console.log('ℹ️ Default tenant already exists. Enforcing Global Admin password reset...');
        tenantId = existingAdmin.tenantId;

        // Force reset admin password to password123 during re-seed
        await prisma.user.update({
            where: { email: 'admin@nomosdesk.com' },
            data: {
                passwordHash: await bcrypt.hash('password123', 10),
                name: 'Sovereign Admin'
            }
        });
        console.log('✅ Global Admin password reset to password123');

        const counselUser = await prisma.user.findUnique({ where: { email: 'counsel@nomosdesk.com' } });
        counselId = counselUser?.id;
    }

    // Update Matter creation to use dynamic IDs
    if (counselId) {
        // Matters ...

        // Matters
        const matter1 = await prisma.matter.upsert({
            where: { id: 'MT-772' },
            update: {},
            create: {
                id: 'MT-772', name: 'Acme Corp Merger', client: 'Acme Corp', type: 'M&A', status: 'OPEN', riskLevel: 'HIGH',
                tenantId: tenantId!, internalCounselId: counselId!
            }
        });

        console.log('✅ Seeded Matter 1');

        // Create a mock encrypted document to verify BYOK logic
        await prisma.document.upsert({
            where: { id: 'DOC-SOV-ENCRYPTED' },
            update: {},
            create: {
                id: 'DOC-SOV-ENCRYPTED',
                name: 'Sovereign Acquisition Memo (Encrypted)',
                uri: 'local://vault/acme/memo_encrypted.pdf',
                jurisdiction: 'GH_ACC_1',
                matterId: matter1.id
            }
        });
        console.log('✅ Seeded Encrypted Mock Document');

        console.log('🌱 Seeding Pricing Configurations...');
        const pricingConfigs = [
            {
                id: 'Starter',
                basePrice: 99,
                pricePerUser: 10,
                creditsIncluded: 0,
                maxUsers: 5,
                features: ['5 Users Max', 'Basic Conflict Checking', 'Standard Document Management', 'No Chatbot Widget']
            },
            {
                id: 'Professional',
                basePrice: 149,
                pricePerUser: 15,
                creditsIncluded: 50,
                maxUsers: 50,
                features: ['50 Users Max', 'Advanced Conflict Workflows', 'AI Chatbot Widget (Included)', 'Audit Logs (30 Days)', 'Priority Support']
            },
            {
                id: 'Institutional',
                basePrice: 0, // Custom
                pricePerUser: 25,
                creditsIncluded: 0,
                maxUsers: 10000, // Unlimited
                features: ['Unlimited Users', 'Multi-Entity Support', 'Full Audit Trail', 'White-Label Chatbot', 'SSO & Custom Security']
            }
        ];

        console.log('🌱 Bulk Seeding Pricing Configurations...');
        await prisma.pricingConfig.createMany({
            data: pricingConfigs,
            skipDuplicates: true
        });

        // Regulatory Rules
        const rules = [
            { id: 'REG-001', name: 'GDPR Data Sovereignty', description: 'Ensure EU user data remains within EU enclaves.', region: 'EU', isActive: true, authority: 'EU Commission', triggerKeywords: ['personal data', 'eu citizen'], blockThreshold: 0.8 },
            { id: 'REG-002', name: 'CCPA Consumer Rights', description: 'Enforce right to deletion for CA residents.', region: 'US', isActive: true, authority: 'California State', triggerKeywords: ['california', 'consumer'], blockThreshold: 0.7 },
            { id: 'REG-003', name: 'Banking Secrecy Act', description: 'Flag transactions over $10k for review.', region: 'US', isActive: false, authority: 'FinCEN', triggerKeywords: ['transaction', 'structuring'], blockThreshold: 0.9 },
            // Jurisdictional Specific Rules
            { id: 'REG-SOV-001', name: 'Data Protection Act (Section A)', description: 'Mandates registration of data controllers and protects personal data.', region: 'GH_ACC_1', isActive: true, authority: 'Ghana Data Protection Commission', triggerKeywords: ['digital address', 'ghana card', 'voters id'], blockThreshold: 0.8 },
            { id: 'REG-SOV-002', name: 'POPIA Compliance Sentinel', description: 'Enforces Protection of Personal Information Act for South African subjects.', region: 'ZA_JNB_1', isActive: true, authority: 'Information Regulator (South Africa)', triggerKeywords: ['id number', 'biometric', 'account number', 'political persuasion'], blockThreshold: 0.85 },
            { id: 'REG-SOV-003', name: 'NDPR Data Privacy Framework', description: 'Nigeria Data Protection Regulation compliance layer.', region: 'NG_LOS_1', isActive: true, authority: 'NITDA', triggerKeywords: ['national identity number', 'nin', 'health data', 'bvnt'], blockThreshold: 0.8 },
            { id: 'REG-SOV-004', name: 'AML/CFT Africa Cluster', description: 'Anti-Money Laundering monitoring for regional suspicious transactions.', region: 'PRIMARY', isActive: true, authority: 'Financial Intelligence Centre', triggerKeywords: ['laundering', 'structuring', 'suspicious deposit', 'terrorist financing'], blockThreshold: 0.9 }
        ];

        console.log('🌱 Seeding Regulatory Rules...');
        console.log('🌱 Bulk Seeding Regulatory Rules...');
        await prisma.regulatoryRule.createMany({
            data: rules,
            skipDuplicates: true
        });
        // Locked scope: 10 specific templates
        const docTemplates = [
            {
                name: 'Mutual Non-Disclosure Agreement',
                description: 'Standard NDA for mutual exchange of confidential business information between two parties.',
                category: 'Corporate',
                jurisdiction: 'GLOBAL',
                version: '1.2.0',
                structure: {
                    fields: [
                        { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
                        { key: 'party_a_name', label: 'Party A Name', type: 'text', placeholder: 'e.g. Acme Corp', required: true },
                        { key: 'party_b_name', label: 'Party B Name', type: 'text', placeholder: 'e.g. Beta Ltd', required: true },
                        { key: 'governing_law', label: 'Governing Law', type: 'text', placeholder: 'e.g. State of New York', required: true },
                        { key: 'purpose_description', label: 'Purpose', type: 'text', multiline: true, placeholder: 'Describe the business purpose...', required: true }
                    ],
                    sections: [
                        { key: 'include_non_solicit', label: 'Include Non-Solicitation Clause?', default: false }
                    ]
                },
                content: `
# MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of **{{effective_date}}** (the "Effective Date") by and between:

**{{party_a_name}}**, a corporation organized and existing under the laws of {{governing_law}}, and

**{{party_b_name}}**, a corporation organized and existing under the laws of {{governing_law}}.

### 1. Purpose
The parties wish to explore a business opportunity of mutual interest (the "**{{purpose_description}}**"). In connection with the Purpose, each party may disclose to the other certain confidential technical and business information.

### 2. Confidential Information
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects that is designated as "Confidential," "Proprietary" or some similar designation.

### 3. Term
This Agreement and the duty to hold Confidential Information in confidence shall remain in effect for a period of five (5) years.

{{#if include_non_solicit}}
### 4. Non-Solicitation
During the Term and for a period of one (1) year thereafter, neither party shall solicit for employment any employee of the other party.
{{/if}}

---
Signed:

**For {{party_a_name}}:** ____________________ Date: _________

**For {{party_b_name}}:** ____________________ Date: _________
`
            },
            {
                name: 'Service Agreement',
                description: 'Agreement defining the relationship between a service provider and a client.',
                category: 'Corporate',
                jurisdiction: 'GLOBAL',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'start_date', label: 'Agreement Start Date', type: 'date', required: true },
                        { key: 'provider_name', label: 'Provider Name', type: 'text', required: true },
                        { key: 'client_name', label: 'Client Name', type: 'text', required: true },
                        { key: 'service_description', label: 'Services Description', type: 'text', multiline: true, required: true },
                        { key: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. Net 30', required: true }
                    ],
                    sections: [
                        { key: 'include_indemnification', label: 'Include Indemnification Clause?', default: true }
                    ]
                },
                content: `
# SERVICE AGREEMENT

This Service Agreement is made between **{{provider_name}}** ("Provider") and **{{client_name}}** ("Client") as of **{{start_date}}**.

### 1. Services Provided
Provider agrees to render the following services to Client: **{{service_description}}**.

### 2. Payment Terms
Client agrees to pay Provider according to the following schedule: **{{payment_terms}}**.

### 3. Independent Contractor
Provider enters this Agreement as an independent contractor and not as an employee of Client.

{{#if include_indemnification}}
### 4. Indemnification
Provider agrees to indemnify and hold harmless Client from any claims arising out of Provider's negligence or misconduct.
{{/if}}

---
`
            },
            {
                name: 'Employment Contract',
                description: 'Standard full-time employment contract outlining duties, compensation, and benefits.',
                category: 'Employment',
                jurisdiction: 'Local',
                version: '2.1.0',
                structure: {
                    fields: [
                        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
                        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                        { key: 'employee_name', label: 'Employee Name', type: 'text', required: true },
                        { key: 'position_title', label: 'Job Title', type: 'text', required: true },
                        { key: 'salary_amount', label: 'Annual Salary', type: 'currency', currency: 'USD', required: true },
                        { key: 'probation_period_months', label: 'Probation Period (Months)', type: 'number', default: 3 }
                    ],
                    sections: [
                        { key: 'include_ip_assignment', label: 'Include IP Assignment Clause?', default: true }
                    ]
                },
                content: `
# EMPLOYMENT CONTRACT

**THIS AGREEMENT** is made on **{{start_date}}** BETWEEN **{{company_name}}** (the "Employer") AND **{{employee_name}}** (the "Employee").

### 1. Position
The Employer employs the Employee in the position of **{{position_title}}**.

### 2. Remuneration
The Employee will receive a gross annual salary of **{{salary_amount}}**, payable in monthly installments.

### 3. Probation Period
The first **{{probation_period_months}}** months of employment shall be a probationary period.

### 4. Duties
The Employee agrees to devote their full working time and attention to the business of the Employer.

{{#if include_ip_assignment}}
### 5. Intellectual Property
Any intellectual property created by the Employee during the course of employment shall belong exclusively to the Employer.
{{/if}}

---
`
            },
            {
                name: 'Offer Letter',
                description: 'Formal letter offering employment to a candidate.',
                category: 'Employment',
                jurisdiction: 'Local',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'start_date', label: 'Start Date', type: 'date', required: true },
                        { key: 'candidate_name', label: 'Candidate Name', type: 'text', required: true },
                        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                        { key: 'offer_position', label: 'Position Offered', type: 'text', required: true },
                        { key: 'supervisor_name', label: 'Reporting To', type: 'text', required: true }
                    ],
                    sections: []
                },
                content: `
# EMPLOYMENT OFFER LETTER

**Date:** {{start_date}}

**To:** {{candidate_name}}

**Dear {{candidate_name}},**

**{{company_name}}** is pleased to offer you the position of **{{offer_position}}**. We believe your skills and experience are an excellent match for our company.

**Start Date:** Your employment will commence on {{start_date}}.
**Reporting To:** You will report directly to **{{supervisor_name}}**.

We look forward to welcoming you to the team.

Sincerely,

Hiring Manager
**{{company_name}}**
`
            },
            {
                name: 'Memorandum of Understanding (MoU)',
                description: 'Non-binding agreement outlining the terms of a new relationship.',
                category: 'Corporate',
                jurisdiction: 'GLOBAL',
                version: '1.1.0',
                structure: {
                    fields: [
                        { key: 'signing_date', label: 'Signing Date', type: 'date', required: true },
                        { key: 'party_a', label: 'Party A', type: 'text', required: true },
                        { key: 'party_b', label: 'Party B', type: 'text', required: true },
                        { key: 'mutual_goal', label: 'Mutual Goal', type: 'text', multiline: true, required: true }
                    ],
                    sections: [
                        { key: 'include_confidentiality', label: 'Include Confidentiality Section?', default: false }
                    ]
                },
                content: `
# MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MoU) is made on **{{signing_date}}** between **{{party_a}}** and **{{party_b}}**.

### 1. Objective
The parties share the common goal of **{{mutual_goal}}**. This MoU outlines the framework for cooperation to achieve this objective.

### 2. Non-Binding
This MoU is not intended to create legal or binding obligations between the Parties.

{{#if include_confidentiality}}
### 3. Confidentiality
Both parties agree to keep the discussions regarding this MoU confidential.
{{/if}}

---
`
            },
            {
                name: 'Demand Letter',
                description: 'Formal letter demanding payment or action to resolve a dispute.',
                category: 'Disputes',
                jurisdiction: 'Local',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'deadline_date', label: 'Payment Deadline', type: 'date', required: true },
                        { key: 'recipient_name', label: 'Recipient Name', type: 'text', required: true },
                        { key: 'sender_name', label: 'Sender Name', type: 'text', required: true },
                        { key: 'breach_details', label: 'Details of Breach/Issue', type: 'text', multiline: true, required: true },
                        { key: 'amount_due', label: 'Amount Due', type: 'currency', currency: 'USD', required: true }
                    ],
                    sections: []
                },
                content: `
# CEASE AND DESIST / DEMAND LETTER

**DATE:** {{deadline_date}}

**TO:** {{recipient_name}}

**FROM:** {{sender_name}}

**RE:** Demand for Payment / Cease and Desist

Dear Sir/Madam,

This letter serves as a formal demand regarding **{{breach_details}}**.

You are hereby required to pay the outstanding amount of **{{amount_due}}** by **{{deadline_date}}**. Failure to comply will result in immediate legal action.

Governed yourself accordingly.

Sincerely,
**{{sender_name}}**
`
            },
            {
                name: 'Board Resolution',
                description: 'Record of decisions made by the Board of Directors.',
                category: 'Corporate',
                jurisdiction: 'GLOBAL',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'meeting_date', label: 'Meeting Date', type: 'date', required: true },
                        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                        { key: 'resolution_topic', label: 'Resolution Topic', type: 'text', required: true },
                        { key: 'decision_details', label: 'Decision Details', type: 'text', multiline: true, required: true }
                    ],
                    sections: []
                },
                content: `
# BOARD RESOLUTION OF {{company_name}}

**DATE:** {{meeting_date}}

**TOPIC:** {{resolution_topic}}

**WHEREAS**, the Board of Directors of **{{company_name}}** has discussed the matter of **{{resolution_topic}}**;

**IT IS HEREBY RESOLVED:**
That **{{decision_details}}**.

The undersigned certify that the foregoing resolution was duly adopted by the Board of Directors.

---
`
            },
            {
                name: 'Lease Agreement',
                description: 'Contract for renting residential or commercial property.',
                category: 'Property',
                jurisdiction: 'Local',
                version: '1.3.0',
                structure: {
                    fields: [
                        { key: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
                        { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
                        { key: 'property_address', label: 'Property Address', type: 'text', required: true },
                        { key: 'lease_term_months', label: 'Term (Months)', type: 'number', required: true },
                        { key: 'monthly_rent', label: 'Monthly Rent', type: 'currency', currency: 'USD', required: true }
                    ],
                    sections: [
                        { key: 'include_pets_clause', label: 'Include Pets Clause?', default: false }
                    ]
                },
                content: `
# RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_name}}** ("Tenant").

### 1. Property
Landlord agrees to lease to Tenant the premises located at: **{{property_address}}**.

### 2. Term
The term of this lease shall be for **{{lease_term_months}}** months.

### 3. Rent
Tenant agrees to pay **{{monthly_rent}}** per month on the 1st day of each month.

{{#if include_pets_clause}}
### 4. Pets
Tenant is permitted to keep up to two (2) domestic pets on the premises, subject to a pet deposit.
{{/if}}

---
`
            },
            {
                name: 'Privacy Policy',
                description: 'Policy outlining how an organization collects and handles data.',
                category: 'Compliance',
                jurisdiction: 'GLOBAL',
                version: '2.0.0',
                structure: {
                    fields: [
                        { key: 'effective_date', label: 'Effective Date', type: 'date', required: true },
                        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                        { key: 'website_url', label: 'Website URL', type: 'text', required: true },
                        { key: 'contact_email', label: 'Contact Email', type: 'text', required: true },
                        { key: 'data_types_collected', label: 'Data Collected', type: 'text', multiline: true, placeholder: 'e.g. name, email, IP address...', required: true }
                    ],
                    sections: [
                        { key: 'include_cookie_policy', label: 'Include Cookie Policy Section?', default: true }
                    ]
                },
                content: `
# PRIVACY POLICY

**Last Updated:** {{effective_date}}

**{{company_name}}** ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website **{{website_url}}**.

### 1. Information We Collect
We collect the following types of information: **{{data_types_collected}}**.

### 2. How We Use Information
We use the information we collect to provide, maintain, and improve our services.

{{#if include_cookie_policy}}
### 3. Cookies
We use cookies to enhance your experience. By using our website, you consent to our use of cookies.
{{/if}}

### Contact Us
If you have questions, please contact us at **{{contact_email}}**.
`
            },
            {
                name: 'Termination Letter',
                description: 'Formal notice of contract or employment termination.',
                category: 'Employment',
                jurisdiction: 'Local',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'termination_date', label: 'Effective Date', type: 'date', required: true },
                        { key: 'recipient_name', label: 'Recipient Name', type: 'text', required: true },
                        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
                        { key: 'reason_for_termination', label: 'Reason', type: 'text', multiline: true, required: true }
                    ],
                    sections: []
                },
                content: `
# NOTICE OF TERMINATION

**TO:** {{recipient_name}}

**FROM:** {{company_name}}

**DATE:** {{termination_date}}

**RE:** Termination of Employment

Dear {{recipient_name}},

This letter serves to confirm that your employment with **{{company_name}}** is terminated effective **{{termination_date}}**.

Reason for termination: **{{reason_for_termination}}**.

Please return all company property immediately.

Sincerely,

Human Resources
**{{company_name}}**
`
            },
            {
                name: 'Standard Non-Disclosure Agreement',
                description: 'A neutral, low-risk mutual NDA suitable for standard business transactions.',
                category: 'Corporate',
                jurisdiction: 'GLOBAL',
                version: '1.0.0',
                structure: {
                    fields: [
                        { key: 'effective_date', label: 'Effective Date', type: 'date', required: true, placeholder: 'Select the date the agreement becomes active' },
                        { key: 'disclosing_party_name', label: 'Disclosing Party Name', type: 'text', required: true, placeholder: 'Full legal name of the entity disclosing information' },
                        { key: 'disclosing_party_address', label: 'Disclosing Party Address', type: 'text', multiline: true, required: true, placeholder: 'Full registered address including city and country' },
                        { key: 'receiving_party_name', label: 'Receiving Party Name', type: 'text', required: true, placeholder: 'Full legal name of the entity receiving information' },
                        { key: 'receiving_party_address', label: 'Receiving Party Address', type: 'text', multiline: true, required: true, placeholder: 'Full registered address including city and country' },
                        { key: 'business_purpose', label: 'Business Purpose', type: 'text', multiline: true, required: true, placeholder: 'Brief description of why information is being shared' },
                        { key: 'term_years', label: 'Term (Years)', type: 'number', default: 2, required: true, placeholder: 'Number of years the agreement remains active' },
                        { key: 'survival_years', label: 'Survival Period (Years)', type: 'number', default: 5, required: true, placeholder: 'Years confidentiality lasts after agreement ends' },
                        { key: 'governing_jurisdiction', label: 'Governing Jurisdiction', type: 'text', default: 'New York', required: true, placeholder: 'State or Country law that governs the agreement' },
                        { key: 'disclosing_party_signer_name', label: 'Disclosing Party Signer', type: 'text', required: true, placeholder: 'Name of person signing for Disclosing Party' },
                        { key: 'disclosing_party_signer_title', label: 'Disclosing Party Title', type: 'text', required: true, placeholder: 'Check signer has authority (e.g. Director, CEO)' },
                        { key: 'receiving_party_signer_name', label: 'Receiving Party Signer', type: 'text', required: true, placeholder: 'Name of person signing for Receiving Party' },
                        { key: 'receiving_party_signer_title', label: 'Receiving Party Title', type: 'text', required: true, placeholder: 'Check signer has authority (e.g. Director, CEO)' }
                    ],
                    sections: [
                        { key: 'include_non_solicitation', label: 'Include Non-Solicitation Clause?', default: false }
                    ]
                },
                content: `
# NON-DISCLOSURE AGREEMENT

### 1. Parties and Effective Date
This Non-Disclosure Agreement (the "Agreement") is effective as of **{{effective_date}}** (the "Effective Date"), by and between **{{disclosing_party_name}}**, having its principal place of business at {{disclosing_party_address}} ("Disclosing Party"), and **{{receiving_party_name}}**, having its principal place of business at {{receiving_party_address}} ("Receiving Party").

### 2. Purpose
The parties wish to explore a potential business relationship regarding **{{business_purpose}}** (the "Purpose"). In connection with the Purpose, the Disclosing Party may disclose certain Confidential Information to the Receiving Party.

### 3. Definition of Confidential Information
"Confidential Information" means all non-public, confidential, or proprietary information disclosed by the Disclosing Party to the Receiving Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

### 4. Exclusions
Confidential Information does not include information that: (a) is or becomes generally available to the public other than as a result of a breach of this Agreement; (b) was in the Receiving Party’s possession prior to disclosure by the Disclosing Party; (c) is received from a third party without breach of any obligation of confidentiality; or (d) was independently developed by the Receiving Party without use of the Confidential Information.

### 5. Obligations of Receiving Party
The Receiving Party shall: (a) protect the confidentiality of the Confidential Information using the same degree of care that it uses to protect its own confidential information of like kind, but in no event less than reasonable care; (b) not use any Confidential Information for any purpose other than the Purpose; and (c) not disclose Confidential Information to any third party, except to its employees, contractors, and advisors who need to know such information for the Purpose and who are bound by confidentiality obligations at least as protective as those in this Agreement.

### 6. Term and Termination
This Agreement shall remain in effect for a period of **{{term_years}}** years from the Effective Date. The obligations of confidentiality concerning the Confidential Information shall survive the expiration or termination of this Agreement for a period of **{{survival_years}}** years.

### 7. Compelled Disclosure
If the Receiving Party is compelled by law or court order to disclose Confidential Information, it shall provide the Disclosing Party with prior notice (to the extent legally permitted) to enable the Disclosing Party to seek a protective order.

### 8. Return or Destruction of Materials
Upon request of the Disclosing Party or termination of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information and all copies thereof.

### 9. No License
Nothing in this Agreement is intended to grant any rights to the Receiving Party under any patent, copyright, or other intellectual property right of the Disclosing Party, nor shall this Agreement grant the Receiving Party any rights in or to the Confidential Information.

{{#if include_non_solicitation}}
### 10. Non-Solicitation
During the term of this Agreement and for a period of twelve (12) months thereafter, neither party will solicit for employment any employee of the other party with whom they came into contact in connection with the Purpose.
{{/if}}

### 11. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of **{{governing_jurisdiction}}**, without regard to its conflict of law principles.

### 12. Remedies
The parties acknowledge that a breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be inadequate. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to any other remedies available at law.

### 13. Entire Agreement
This Agreement constitutes the entire agreement between the parties relative to the subject matter hereof and supersedes all prior or contemporaneous agreements, representations, and understandings of the parties.

### 14. Signatures
IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

**Disclosing Party:** ___________________________
Name: **{{disclosing_party_signer_name}}**
Title: **{{disclosing_party_signer_title}}**

**Receiving Party:** ___________________________
Name: **{{receiving_party_signer_name}}**
Title: **{{receiving_party_signer_title}}**
`
            }
        ];

        console.log('🌱 Bulk Seeding Document Templates...');
        const templateData = docTemplates.map(t => ({
            id: `template-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: t.name,
            description: t.description,
            category: t.category,
            jurisdiction: t.jurisdiction,
            content: t.content,
            structure: t.structure,
            version: t.version
        }));

        await prisma.documentTemplate.createMany({
            data: templateData as any,
            skipDuplicates: true
        });

        console.log(`✅ Seeded ${docTemplates.length} Document Templates`);

        // Dynamic Template Loading from JSON files
        console.log('🌱 Seeding Dynamic JSON Templates...');
        const templatesDir = path.join(process.cwd(), 'prisma', 'templates');
        if (fs.existsSync(templatesDir)) {
            const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(templatesDir, file);
                const templateData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                await prisma.documentTemplate.upsert({
                    where: { id: file.replace('.json', '') },
                    update: {
                        name: templateData.name || templateData.template_name || file.replace('.json', ''),
                        description: templateData.description || `${templateData.category || 'Standard'} Template`,
                        category: templateData.category || 'GENERAL',
                        jurisdiction: templateData.jurisdiction || 'GLOBAL',
                        content: templateData.content || '',
                        structure: templateData.clauses || templateData.structure || { fields: [], sections: [] },
                        version: templateData.version || '1.0.0'
                    },
                    create: {
                        id: file.replace('.json', ''),
                        name: templateData.name || templateData.template_name || file.replace('.json', ''),
                        description: templateData.description || `${templateData.category || 'Standard'} Template`,
                        category: templateData.category || 'GENERAL',
                        jurisdiction: templateData.jurisdiction || 'GLOBAL',
                        content: templateData.content || '',
                        structure: templateData.clauses || templateData.structure || { fields: [], sections: [] },
                        version: templateData.version || '1.0.0'
                    }
                });
                console.log(`   - Seeded Dynamic Template: ${templateData.name || templateData.template_name}`);
            }
        }
    }
}

export async function seedDatabase() {
    try {
        await main();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute when run directly
seedDatabase();
