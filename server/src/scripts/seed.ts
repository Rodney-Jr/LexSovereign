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
    // Document Templates
    const docTemplates = [
        {
            id: 'TPL-NDA-001',
            name: 'Standard Mutual NDA',
            description: 'Mutual non-disclosure agreement for early-stage partnership discussions.',
            category: 'CORPORATE',
            jurisdiction: 'GLOBAL',
            content: '# MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into between **{{PARTY_A}}** and **{{PARTY_B}}** on this date **{{EFFECTIVE_DATE}}**.\n\n1. **Purpose**: The parties wish to explore a potential business relationship relating to **{{PROJECT_NAME}}**.\n2. **Confidential Information**: Means any data, reports, or trade secrets disclosed during the term...\n3. **Term**: This agreement shall remain in effect for **{{TERM_YEARS}}** years.',
            placeholders: ['PARTY_A', 'PARTY_B', 'EFFECTIVE_DATE', 'PROJECT_NAME', 'TERM_YEARS'],
            version: '1.0.0'
        },
        {
            id: 'TPL-DEED-GH-001',
            name: 'Deed of Assignment (Land)',
            description: 'Standard conveyance document for the transfer of land interests in Ghana.',
            category: 'REAL_ESTATE',
            jurisdiction: 'GH_ACC_1',
            content: '# DEED OF ASSIGNMENT\n\n**THIS DEED** is made the day of **{{DAY}}** of **{{MONTH}}**, **{{YEAR}}**.\n\n**BETWEEN**: **{{ASSIGNOR_NAME}}** (hereinafter called the "Assignor") and **{{ASSIGNEE_NAME}}** (hereinafter called the "Assignee").\n\n**WHEREAS**: The Assignor is the beneficial owner of the land described as **{{PROPERTY_DESCRIPTION}}** located at **{{LOCATION}}**.\n\n**CONSIDERATION**: In consideration of the sum of **{{CURRENCY}} {{AMOUNT}}**...',
            placeholders: ['DAY', 'MONTH', 'YEAR', 'ASSIGNOR_NAME', 'ASSIGNEE_NAME', 'PROPERTY_DESCRIPTION', 'LOCATION', 'CURRENCY', 'AMOUNT'],
            version: '1.1.0'
        },
        {
            id: 'TPL-SPA-001',
            name: 'Share Purchase Agreement (Simplified)',
            description: 'Short-form SPA for private company share transfers.',
            category: 'CORPORATE',
            jurisdiction: 'GLOBAL',
            content: '# SHARE PURCHASE AGREEMENT\n\n**SELLER**: {{SELLER_NAME}}\n**BUYER**: {{BUYER_NAME}}\n**COMPANY**: {{COMPANY_NAME}}\n\n1. **Sale and Purchase**: The Seller agrees to sell and the Buyer agrees to purchase **{{SHARE_COUNT}}** Ordinary Shares in the capital of the Company for the price of {{PRICE}}.',
            placeholders: ['SELLER_NAME', 'BUYER_NAME', 'COMPANY_NAME', 'SHARE_COUNT', 'PRICE'],
            version: '1.0.0'
        }
    ];

    console.log('🌱 Seeding Document Templates...');
    for (const tpl of docTemplates) {
        await prisma.documentTemplate.upsert({
            where: { id: tpl.id },
            update: {},
            create: tpl
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
