import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
];

const ROLES = [
    { name: 'GLOBAL_ADMIN', permissions: ['manage_platform', 'create_tenant', 'configure_bridge', 'read_all_audits'] },
    { name: 'TENANT_ADMIN', permissions: ['manage_tenant', 'manage_users', 'manage_roles', 'approve_spend', 'create_matter'] },
    { name: 'PARTNER', permissions: ['sign_document', 'close_matter', 'create_matter', 'edit_document', 'override_ai', 'approve_spend'] },
    { name: 'SENIOR_COUNSEL', permissions: ['create_matter', 'edit_document', 'override_ai', 'draft_document'] },
    { name: 'INTERNAL_COUNSEL', permissions: ['create_matter', 'read_assigned_matter', 'check_conflicts', 'review_work', 'upload_document'] },
    { name: 'JUNIOR_ASSOCIATE', permissions: ['draft_document', 'upload_document'] },
    { name: 'LEGAL_OPS', permissions: ['design_workflow', 'manage_users', 'read_billing', 'read_all_audits'] },
    { name: 'COMPLIANCE', permissions: ['read_all_audits', 'manage_tenant'] },
    { name: 'FINANCE_BILLING', permissions: ['read_billing'] },
    { name: 'EXTERNAL_COUNSEL', permissions: ['upload_document', 'draft_document'] }
];

async function main() {
    console.log('🌱 Seeding Permissions...');
    for (const p of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { id: p.id },
            update: {},
            create: p
        });
    }

    console.log('🌱 Seeding System Roles...');
    for (const r of ROLES) {
        // Create role if not exists
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: {}, // Don't overwrite existing perms to avoid resetting custom changes if we run seed again? 
            // Actually for system roles strict sync might be better. Let's strict sync for now.
            create: {
                name: r.name,
                description: `System Role: ${r.name}`,
                isSystem: true,
                permissions: {
                    connect: r.permissions.map(id => ({ id }))
                }
            }
        });
    }

    // Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'default-demo-tenant-id' }, // Use a stable ID for seeding
        update: {},
        create: {
            id: 'default-demo-tenant-id',
            name: 'LexSovereign Demo',
            plan: 'ENTERPRISE',
            appMode: 'LAW_FIRM',
            primaryRegion: 'GH_ACC_1'
        }
    });

    const passwordHash = await bcrypt.hash('password123', 10);

    // Fetch generic IDs for roles
    const globalAdminRole = await prisma.role.findUnique({ where: { name: 'GLOBAL_ADMIN' } });
    const seniorCounselRole = await prisma.role.findUnique({ where: { name: 'SENIOR_COUNSEL' } });

    // Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@lexsovereign.com' },
        update: {},
        create: {
            email: 'admin@lexsovereign.com',
            passwordHash,
            name: 'Sovereign Admin',
            roleId: globalAdminRole?.id,
            roleString: 'GLOBAL_ADMIN',
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    const counsel = await prisma.user.upsert({
        where: { email: 'counsel@lexsovereign.com' },
        update: {},
        create: {
            email: 'counsel@lexsovereign.com',
            passwordHash,
            name: 'Internal Counsel',
            roleId: seniorCounselRole?.id,
            roleString: 'INTERNAL_COUNSEL',
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    console.log(`✅ Seeded Users: ${admin.email}, ${counsel.email}`);

    // Matters
    const matter1 = await prisma.matter.upsert({
        where: { id: 'MT-772' },
        update: {},
        create: {
            id: 'MT-772', name: 'Acme Corp Merger', client: 'Acme Corp', type: 'M&A', status: 'OPEN', riskLevel: 'HIGH',
            tenantId: tenant.id, internalCounselId: counsel.id
        }
    });

    console.log('✅ Seeded Matter 1');

    console.log('🌱 Seeding Pricing Configurations...');
    const pricingConfigs = [
        {
            id: 'Standard',
            basePrice: 99,
            pricePerUser: 10,
            creditsIncluded: 500,
            features: ['Multi-tenant Storage', 'Base Guardrails', '500 AI Credits']
        },
        {
            id: 'Sovereign',
            basePrice: 499,
            pricePerUser: 15,
            creditsIncluded: 10000,
            features: ['Dedicated Partition', 'Full RRE Engine', '10,000 AI Credits', 'BYOK Ready']
        },
        {
            id: 'Enclave Exclusive',
            basePrice: 1999,
            pricePerUser: 25,
            creditsIncluded: 0, // Unlimited or specific
            features: ['Physical TEE Access', 'Forensic Ledger', 'Zero-Knowledge Sync', 'Unlimited Credits']
        }
    ];

    for (const config of pricingConfigs) {
        await prisma.pricingConfig.upsert({
            where: { id: config.id },
            update: {},
            create: config
        });
    }

    // Regulatory Rules
    const rules = [
        { id: 'REG-001', name: 'GDPR Data Sovereignty', description: 'Ensure EU user data remains within EU enclaves.', region: 'EU', isActive: true, authority: 'EU Commission', triggerKeywords: ['personal data', 'eu citizen'], blockThreshold: 0.8 },
        { id: 'REG-002', name: 'CCPA Consumer Rights', description: 'Enforce right to deletion for CA residents.', region: 'US', isActive: true, authority: 'California State', triggerKeywords: ['california', 'consumer'], blockThreshold: 0.7 },
        { id: 'REG-003', name: 'Banking Secrecy Act', description: 'Flag transactions over $10k for review.', region: 'US', isActive: false, authority: 'FinCEN', triggerKeywords: ['transaction', 'structuring'], blockThreshold: 0.9 },
        // Ghana Specific Rules (Since we are GH_ACC_1)
        { id: 'REG-GH-001', name: 'Data Protection Act, 2012 (Act 843)', description: 'Mandates registration of data controllers and protects personal data.', region: 'GH_ACC_1', isActive: true, authority: 'Data Protection Commission', triggerKeywords: ['ghana card', 'digital address', 'personal data'], blockThreshold: 0.85 },
        { id: 'REG-GH-002', name: 'BoG AML/CFT Guidelines', description: 'Anti-Money Laundering monitoring for suspicious transactions.', region: 'GH_ACC_1', isActive: true, authority: 'Bank of Ghana', triggerKeywords: ['laundering', 'structuring', 'suspicious'], blockThreshold: 0.9 }
    ];

    console.log('🌱 Seeding Regulatory Rules...');
    for (const rule of rules) {
        await prisma.regulatoryRule.upsert({
            where: { id: rule.id },
            update: {},
            create: rule
        });
    }
    // Locked scope: 10 specific templates
    const docTemplates = [
        {
            name: 'Mutual Non-Disclosure Agreement',
            description: 'Standard NDA for mutual exchange of confidential business information between two parties.',
            category: 'Corporate',
            jurisdiction: 'GLOBAL',
            version: '1.2.0',
            placeholders: ['party_a_name', 'party_b_name', 'effective_date', 'purpose_description', 'governing_law'],
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
            placeholders: ['provider_name', 'client_name', 'service_description', 'payment_terms', 'start_date'],
            content: `
# SERVICE AGREEMENT

This Service Agreement is made between **{{provider_name}}** ("Provider") and **{{client_name}}** ("Client") as of **{{start_date}}**.

### 1. Services Provided
Provider agrees to render the following services to Client: **{{service_description}}**.

### 2. Payment Terms
Client agrees to pay Provider according to the following schedule: **{{payment_terms}}**.

### 3. Independent Contractor
Provider enters this Agreement as an independent contractor and not as an employee of Client.

---
`
        },
        {
            name: 'Employment Contract',
            description: 'Standard full-time employment contract outlining duties, compensation, and benefits.',
            category: 'Employment',
            jurisdiction: 'Local',
            version: '2.1.0',
            placeholders: ['employee_name', 'company_name', 'position_title', 'salary_amount', 'start_date'],
            content: `
# EMPLOYMENT CONTRACT

**THIS AGREEMENT** is made on **{{start_date}}** BETWEEN **{{company_name}}** (the "Employer") AND **{{employee_name}}** (the "Employee").

### 1. Position
The Employer employs the Employee in the position of **{{position_title}}**.

### 2. Remuneration
The Employee will receive a gross annual salary of **{{salary_amount}}**, payable in monthly installments.

### 3. Duties
The Employee agrees to devote their full working time and attention to the business of the Employer.

---
`
        },
        {
            name: 'Offer Letter',
            description: 'Formal letter offering employment to a candidate.',
            category: 'Employment',
            jurisdiction: 'Local',
            version: '1.0.0',
            placeholders: ['candidate_name', 'company_name', 'offer_position', 'start_date', 'supervisor_name'],
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
            placeholders: ['party_a', 'party_b', 'mutual_goal', 'signing_date'],
            content: `
# MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MoU) is made on **{{signing_date}}** between **{{party_a}}** and **{{party_b}}**.

### 1. Objective
The parties share the common goal of **{{mutual_goal}}**. This MoU outlines the framework for cooperation to achieve this objective.

### 2. Non-Binding
This MoU is not intended to create legal or binding obligations between the Parties.

---
`
        },
        {
            name: 'Demand Letter',
            description: 'Formal letter demanding payment or action to resolve a dispute.',
            category: 'Disputes',
            jurisdiction: 'Local',
            version: '1.0.0',
            placeholders: ['recipient_name', 'sender_name', 'amount_due', 'breach_details', 'deadline_date'],
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
            placeholders: ['company_name', 'meeting_date', 'resolution_topic', 'decision_details'],
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
            placeholders: ['landlord_name', 'tenant_name', 'property_address', 'monthly_rent', 'lease_term_months'],
            content: `
# RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_name}}** ("Tenant").

### 1. Property
Landlord agrees to lease to Tenant the premises located at: **{{property_address}}**.

### 2. Term
The term of this lease shall be for **{{lease_term_months}}** months.

### 3. Rent
Tenant agrees to pay **{{monthly_rent}}** per month on the 1st day of each month.

---
`
        },
        {
            name: 'Privacy Policy',
            description: 'Policy outlining how an organization collects and handles data.',
            category: 'Compliance',
            jurisdiction: 'GLOBAL',
            version: '2.0.0',
            placeholders: ['company_name', 'website_url', 'contact_email', 'data_types_collected'],
            content: `
# PRIVACY POLICY

**Last Updated:** {{start_date}}

**{{company_name}}** ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website **{{website_url}}**.

### 1. Information We Collect
We collect the following types of information: **{{data_types_collected}}**.

### 2. How We Use Information
We use the information we collect to provide, maintain, and improve our services.

### Contact Us
If you have questions, please contact us at **{{contact_email}}**.
`
        },
        {
            name: 'Termination Letter',
            description: 'Formal notifice of contract or employment termination.',
            category: 'Employment',
            jurisdiction: 'Local',
            version: '1.0.0',
            placeholders: ['recipient_name', 'company_name', 'termination_date', 'reason_for_termination'],
            content: `
# NOTICE OF TERMINATION

**TO:** {{recipient_name}}

**FROM:** {{company_name}}

**DATE:** Today

**RE:** Termination of Employment

Dear {{recipient_name}},

This letter serves to confirm that your employment with **{{company_name}}** is terminated effective **{{termination_date}}**.

Reason for termination: **{{reason_for_termination}}**.

Please return all company property immediately.

Sincerely,

Human Resources
**{{company_name}}**
`
        }
    ];

    console.log('🌱 Seeding Document Templates...');
    for (const t of docTemplates) {
        console.log(`Working on: ${t.name}`);
        await prisma.documentTemplate.upsert({
            where: { id: `template-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
            update: {
                content: t.content,
                placeholders: t.placeholders,
                description: t.description,
                category: t.category,
                jurisdiction: t.jurisdiction,
                version: t.version
            },
            create: {
                id: `template-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: t.name,
                description: t.description,
                category: t.category,
                jurisdiction: t.jurisdiction,
                content: t.content,
                placeholders: t.placeholders,
                version: t.version
            }
        });
    }

    console.log(`✅ Seeded ${docTemplates.length} Document Templates`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
