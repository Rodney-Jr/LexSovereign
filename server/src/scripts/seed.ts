import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { TenantService } from '../services/TenantService';

const prisma = new PrismaClient();

const PERMISSIONS = [
    { id: 'VIEW:CLIENT', description: 'Can view clients', resource: 'CLIENT', action: 'VIEW' },
    { id: 'CREATE:CLIENT', description: 'Can create clients', resource: 'CLIENT', action: 'CREATE' },
    { id: 'VIEW:MATTER', description: 'Can view matters', resource: 'MATTER', action: 'VIEW' },
    { id: 'VIEW_STATS:TENANT', description: 'Can view tenant stats', resource: 'TENANT', action: 'VIEW_STATS' },
    { id: 'VIEW_BILLING:TENANT', description: 'Can view billing', resource: 'TENANT', action: 'VIEW_BILLING' },
    { id: 'MANAGE:TENANT_SETTINGS', description: 'Manage tenant settings', resource: 'TENANT_SETTINGS', action: 'MANAGE' },
    { id: 'MANAGE_UI:TENANT', description: 'Manage UI visibility', resource: 'TENANT', action: 'MANAGE_UI' },
    { id: 'MANAGE:USER', description: 'Manage users', resource: 'USER', action: 'MANAGE' },
    { id: 'MANAGE:ROLE', description: 'Manage roles', resource: 'ROLE', action: 'MANAGE' },
    { id: 'CHECK:CONFLICTS', description: 'Perform conflict checks', resource: 'CONFLICTS', action: 'CHECK' },
    { id: 'REVIEW:WORK', description: 'Review work', resource: 'WORK', action: 'REVIEW' },
    { id: 'MANAGE:WORKFLOW', description: 'Design workflows', resource: 'WORKFLOW', action: 'MANAGE' },
    { id: 'UPLOAD:DOCUMENT', description: 'Upload documents', resource: 'DOCUMENT', action: 'UPLOAD' },
    { id: 'CREATE:DRAFT', description: 'Create drafts', resource: 'DRAFT', action: 'CREATE' },
    { id: 'EDIT:DRAFT', description: 'Edit drafts', resource: 'DRAFT', action: 'EDIT' },
    { id: 'SUBMIT:REVIEW', description: 'Submit for review', resource: 'REVIEW', action: 'SUBMIT' },
    { id: 'APPROVE:DOCUMENT', description: 'Approve documents', resource: 'DOCUMENT', action: 'APPROVE' },
    { id: 'EXPORT:DOCUMENT', description: 'Export documents', resource: 'DOCUMENT', action: 'EXPORT' },
    { id: 'EXECUTE:AI', description: 'Execute AI tasks', resource: 'AI', action: 'EXECUTE' },
    { id: 'USE:CHAT', description: 'Use legal chat', resource: 'CHAT', action: 'USE' },
    { id: 'VIEW:CONFIDENTIAL', description: 'View confidential docs', resource: 'DOCUMENT', action: 'VIEW_CONFIDENTIAL' },
    { id: 'ACCESS:ACCOUNTING', description: 'Access accounting', resource: 'ACCOUNTING', action: 'ACCESS' },
    { id: 'MANAGE:EXPENSES', description: 'Manage expenses', resource: 'EXPENSES', action: 'MANAGE' },
    { id: 'MANAGE:BUDGET', description: 'Manage budgets', resource: 'BUDGET', action: 'MANAGE' },
    { id: 'ACCESS:HR', description: 'Access HR', resource: 'HR', action: 'ACCESS' },
    { id: 'ACCESS:CLIENT_PORTAL', description: 'Access client portal', resource: 'CLIENT_PORTAL', action: 'ACCESS' },
    { id: 'ACCESS:INFRASTRUCTURE', description: 'Access infrastructure', resource: 'INFRASTRUCTURE', action: 'ACCESS' },
    { id: 'ACCESS:ROADMAP', description: 'Access roadmap', resource: 'ROADMAP', action: 'ACCESS' },
    { id: 'VIEW:TRIAL', description: 'View trial status', resource: 'TRIAL', action: 'VIEW' },
    { id: 'MANAGE:PLATFORM', description: 'Manage platform', resource: 'PLATFORM', action: 'MANAGE' }
];

const ROLES = [
    { name: 'GLOBAL_ADMIN', permissions: ['MANAGE:PLATFORM', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'USE:CHAT'] },
    { name: 'TENANT_ADMIN', permissions: ['MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'MANAGE:ROLE', 'MANAGE:TENANT_SETTINGS', 'MANAGE:WORKFLOW', 'CREATE:DRAFT', 'UPLOAD:DOCUMENT', 'ACCESS:HR', 'ACCESS:ACCOUNTING', 'ACCESS:ROADMAP', 'ACCESS:INFRASTRUCTURE', 'VIEW:TRIAL'] },
    { name: 'MANAGING_PARTNER', permissions: ['MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'VIEW_BILLING:TENANT', 'VIEW:CLIENT', 'CREATE:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'VIEW:MATTER', 'MANAGE:WORKFLOW', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'EXECUTE:AI', 'USE:CHAT', 'VIEW:CONFIDENTIAL', 'MANAGE:BUDGET', 'APPROVE:SPEND', 'MANAGE:EXPENSES', 'ACCESS:HR', 'ACCESS:ACCOUNTING'] },
    { name: 'PARTNER', permissions: ['CREATE:MATTER', 'VIEW:MATTER', 'VIEW_STATS:TENANT', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'APPROVE:DOCUMENT', 'EXPORT:DOCUMENT', 'VIEW_BILLING:TENANT', 'MANAGE:USER', 'MANAGE:WORKFLOW', 'USE:CHAT', 'MANAGE:BUDGET'] },
    { name: 'SENIOR_COUNSEL', permissions: ['CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'USE:CHAT', 'VIEW_BILLING:TENANT'] },
    { name: 'INTERNAL_COUNSEL', permissions: ['CREATE:MATTER', 'VIEW:MATTER', 'CHECK:CONFLICTS', 'REVIEW:WORK', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'USE:CHAT', 'VIEW:CLIENT'] },
    { name: 'JUNIOR_ASSOCIATE', permissions: ['VIEW:MATTER', 'CHECK:CONFLICTS', 'UPLOAD:DOCUMENT', 'CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'CREATE:MATTER', 'USE:CHAT'] },
    { name: 'LEGAL_OPS', permissions: ['MANAGE:USER', 'MANAGE:WORKFLOW', 'VIEW_BILLING:TENANT', 'VIEW_STATS:TENANT', 'CREATE:MATTER', 'UPLOAD:DOCUMENT', 'VIEW:MATTER', 'CREATE:DRAFT', 'CHECK:CONFLICTS', 'USE:CHAT', 'MANAGE:EXPENSES'] },
    { name: 'COMPLIANCE', permissions: ['VIEW_STATS:TENANT', 'MANAGE:TENANT_SETTINGS', 'USE:CHAT'] },
    { name: 'FINANCE_BILLING', permissions: ['VIEW_BILLING:TENANT'] },
    { name: 'EXTERNAL_COUNSEL', permissions: ['VIEW:MATTER', 'UPLOAD:DOCUMENT', 'CREATE:MATTER', 'CREATE:DRAFT', 'USE:CHAT'] },
    { name: 'DEPUTY_GC', permissions: ['MANAGE:USER', 'VIEW_STATS:TENANT', 'CREATE:MATTER', 'REVIEW:WORK', 'CHECK:CONFLICTS', 'VIEW:MATTER', 'MANAGE:ROLE', 'CREATE:DRAFT', 'APPROVE:DOCUMENT', 'VIEW_BILLING:TENANT', 'MANAGE:WORKFLOW', 'USE:CHAT'] },
    { name: 'CLIENT', permissions: ['VIEW:MATTER', 'ACCESS:CLIENT_PORTAL', 'EXPORT:DOCUMENT'] },
    { name: 'EXECUTIVE_BOARD', permissions: ['VIEW_STATS:TENANT', 'VIEW_BILLING:TENANT', 'USE:CHAT'] },
    { name: 'OWNER', permissions: ['CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'APPROVE:DOCUMENT', 'EXPORT:DOCUMENT', 'MANAGE:PLATFORM', 'MANAGE:TENANT_SETTINGS', 'MANAGE:USER', 'MANAGE:ROLE', 'USE:CHAT', 'MANAGE:BUDGET', 'ACCESS:HR', 'ACCESS:ACCOUNTING'] },
    { name: 'PARALEGAL', permissions: ['CREATE:DRAFT', 'EDIT:DRAFT', 'SUBMIT:REVIEW', 'USE:CHAT'] },
    { name: 'AUDITOR', permissions: ['VIEW_STATS:TENANT', 'VIEW:MATTER'] },
    { name: 'CLERK', permissions: ['UPLOAD:FIELD_INTAKE', 'USE:CHAT', 'VIEW:MATTER'] },
    { name: 'ADMIN_MANAGER', permissions: ['VIEW_BILLING:TENANT', 'MANAGE:TENANT_SETTINGS', 'VIEW_STATS:TENANT', 'MANAGE:USER', 'MANAGE:ROLE', 'CHECK:CONFLICTS', 'MANAGE:EXPENSES', 'ACCESS:HR', 'ACCESS:ACCOUNTING'] }
];

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
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

    const globalAdminRole = await prisma.role.findFirst({ where: { name: 'GLOBAL_ADMIN', isSystem: true, tenantId: null } });
    if (!globalAdminRole) {
        console.error('❌ Critical: GLOBAL_ADMIN role not found after seeding!');
        throw new Error('GLOBAL_ADMIN role missing.');
    }

    if (!existingAdmin) {
        const result = await TenantService.provisionTenant({
            name: 'NomosDesk Demo',
            adminEmail: 'admin@nomosdesk.com',
            adminName: 'Sovereign Admin',
            plan: 'ENTERPRISE',
            region: 'GH_ACC_1',
            appMode: 'LAW_FIRM'
        });

        tenantId = result.tenantId;

        console.log(`✅ Provisioned Tenant: ${result.tenantId}`);
        console.log(`✅ Admin Credentials: admin@nomosdesk.com / password123`);

        console.log('🌱 Updating Admin User details...');
        await prisma.user.update({
            where: { id: result.adminId },
            data: {
                roleString: 'GLOBAL_ADMIN',
                role: { connect: { id: globalAdminRole.id } },
                jurisdictionPins: ['GH_ACC_1', 'SOV-PR-1'],
                credentials: [
                    { type: 'SYSTEM_ADMIN', id: 'SA-001' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-GH-001', region: 'GH_ACC_1' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-SOV-001', region: 'SOV-PR-1' }
                ]
            }
        });

        // Create secondary user (Internal Counsel)
        const counselRole = await prisma.role.findFirst({
            where: { name: 'INTERNAL_COUNSEL', tenantId: result.tenantId }
        });

        const counsel = await prisma.user.create({
            data: {
                email: 'counsel@nomosdesk.com',
                passwordHash,
                name: 'Internal Counsel',
                roleId: counselRole?.id,
                roleString: 'INTERNAL_COUNSEL',
                region: 'GH_ACC_1',
                tenantId: result.tenantId,
                jurisdictionPins: ['GH_ACC_1', 'SOV-PR-1'],
                credentials: [
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-GH-002', region: 'GH_ACC_1' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-SOV-002', region: 'SOV-PR-1' }
                ]
            }
        });

        // Create more users for capacity dashboard
        for (let i = 1; i <= 3; i++) {
            await prisma.user.create({
                data: {
                    email: `associate${i}@nomosdesk.com`,
                    passwordHash,
                    name: `Associate ${i}`,
                    roleId: counselRole?.id,
                    roleString: 'JUNIOR_ASSOCIATE',
                    region: 'GH_ACC_1',
                    tenantId: result.tenantId,
                    maxWeeklyHours: 35 + (i * 5),
                    jurisdictionPins: ['GH_ACC_1']
                }
            });
        }

        counselId = counsel.id;
    } else {
        console.log('ℹ️ Default tenant already exists. Enforcing Global Admin role and password...');
        tenantId = existingAdmin.tenantId;

        // Force reset admin and ensure role exists
        await prisma.user.update({
            where: { email: 'admin@nomosdesk.com' },
            data: {
                name: 'Sovereign Admin',
                passwordHash,
                roleString: 'GLOBAL_ADMIN',
                role: { connect: { id: globalAdminRole.id } }
            }
        });
        console.log('✅ Global Admin role and password enforced.');

        const counselUser = await prisma.user.findUnique({ where: { email: 'counsel@nomosdesk.com' } });
        counselId = counselUser?.id;
    }

    // Role IDs (Refetched for use outside the if/else)
    const clerkRole = await prisma.role.findFirst({ where: { name: 'CLERK', tenantId: tenantId } });
    const adminManagerRole = await prisma.role.findFirst({ where: { name: 'ADMIN_MANAGER', tenantId: tenantId } });

    // Idempotent Clerk Seeding
    console.log('🌱 Ensuring Clerk Demo Account exists...');
    await prisma.user.upsert({
        where: { email: 'clerk@nomosdesk.com' },
        update: {
            roleId: clerkRole?.id,
            roleString: 'CLERK',
            name: 'Firm Clerk',
        },
        create: {
            email: 'clerk@nomosdesk.com',
            passwordHash,
            name: 'Firm Clerk',
            roleId: clerkRole?.id,
            roleString: 'CLERK',
            region: 'GH_ACC_1',
            tenantId: tenantId!,
            jurisdictionPins: ['GH_ACC_1'],
            credentials: [{ type: 'FIELD_OPERATIONS_POCKET', id: 'CLERK-001' }]
        }
    });

    // Idempotent Admin Manager Seeding
    console.log('🌱 Ensuring Admin Manager Demo Account exists...');
    await prisma.user.upsert({
        where: { email: 'admin_manager@nomosdesk.com' },
        update: {
            roleId: adminManagerRole?.id,
            roleString: 'ADMIN_MANAGER',
            name: 'Firm Admin Manager',
        },
        create: {
            email: 'admin_manager@nomosdesk.com',
            passwordHash,
            name: 'Firm Admin Manager',
            roleId: adminManagerRole?.id,
            roleString: 'ADMIN_MANAGER',
            region: 'GH_ACC_1',
            tenantId: tenantId!,
            jurisdictionPins: ['GH_ACC_1'],
            credentials: [{ type: 'EXECUTIVE_OPS_BADGE', id: 'ADMIN-001' }]
        }
    });

    // === Pricing Configs: Purge stale tiers, then upsert canonical 3-tier model ===
    const CANONICAL_TIERS = ['Solo', 'Professional', 'Institutional'];
    console.log('🧹 Purging stale pricing tiers not in canonical set...');
    const purged = await prisma.pricingConfig.deleteMany({
        where: { id: { notIn: CANONICAL_TIERS } }
    });
    if (purged.count > 0) {
        console.log(`  🗑️  Removed ${purged.count} stale pricing tier(s) (e.g. Starter, Standard, etc.)`);
    } else {
        console.log('  ✅ No stale tiers found.');
    }

    console.log('🌱 Upserting Pricing Configurations with live Stripe IDs...');
    const pricingConfigs = [
        {
            id: 'Solo',
            basePrice: 19,
            pricePerUser: 5,
            creditsIncluded: 0,
            maxUsers: 5,
            features: ['3 User Seats', 'Core Case Management', 'Digital Intake Hub', 'Mobile-First Access', 'Metered AI Top-ups (Pay-per-use)'],
            stripeBasePriceId: 'price_1T8RidE9NGotUyVqrCuwNIcv',
            stripeUserPriceId: 'price_1T8RidE9NGotUyVqfi0aB0aL'
        },
        {
            id: 'Professional',
            basePrice: 79,
            pricePerUser: 10,
            creditsIncluded: 5000,
            maxUsers: 50,
            features: ['10 User Seats', '5,000 AI Credits Included', 'Professional Enclave Branding', 'Advanced Financial Reporting', 'Priority Disbursement Tracking'],
            stripeBasePriceId: 'price_1T8RieE9NGotUyVqMACuoRfl',
            stripeUserPriceId: 'price_1T8RieE9NGotUyVqitNvjs0g'
        },
        {
            id: 'Institutional',
            basePrice: 299,
            pricePerUser: 0,
            creditsIncluded: 20000,
            maxUsers: 10000,
            features: ['Unlimited User Seats', '20,000 AI Credits Included', 'Dedicated Sovereign Region', 'SSO & 2FA Enclave Security', '99.9% Sovereign Uptime SLA'],
            stripeBasePriceId: 'price_1T8RifE9NGotUyVqC040EUIR',
            stripeUserPriceId: 'price_1T8RigE9NGotUyVqjAsh74OT'
        }
    ];
    for (const config of pricingConfigs) {
        await prisma.pricingConfig.upsert({
            where: { id: config.id },
            update: {
                stripeBasePriceId: (config as any).stripeBasePriceId ?? null,
                stripeUserPriceId: (config as any).stripeUserPriceId ?? null,
                basePrice: config.basePrice,
                pricePerUser: config.pricePerUser,
                maxUsers: config.maxUsers,
                features: config.features
            },
            create: config as any
        });
        console.log(`  ✅ Upserted PricingConfig: ${config.id}`);
    }
    console.log('✅ Pricing Configurations upserted.');

    // Update Matter creation to use dynamic IDs
    if (counselId) {
        // Matters ...

        // Matters
        const matterData = [
            { id: 'MT-GENERAL', name: 'General Enclave Matters', type: 'ADMIN', status: 'OPEN', riskLevel: 'LOW' },
            { id: 'MT-772', name: 'Acme Corp Merger', type: 'M&A', status: 'OPEN', riskLevel: 'HIGH' },
            { id: 'MT-881', name: 'Zylos Tech IP Dispute', type: 'LITIGATION', status: 'OPEN', riskLevel: 'MEDIUM' },
            { id: 'MT-990', name: 'Global Finance Compliance', type: 'COMPLIANCE', status: 'OPEN', riskLevel: 'LOW' },
            { id: 'MT-101', name: 'Startup Series A', type: 'CORPORATE', status: 'OPEN', riskLevel: 'MEDIUM' }
        ];

        for (const m of matterData) {
            await prisma.matter.upsert({
                where: { id: m.id },
                update: { riskLevel: m.riskLevel, tenantId: tenantId! },
                create: {
                    id: m.id,
                    name: m.name,
                    type: m.type,
                    status: m.status,
                    riskLevel: m.riskLevel,
                    tenantId: tenantId!,
                    internalCounselId: counselId!
                }
            });
            console.log(`✅ Seeded Matter: ${m.id}`);
        }

        // Create a mock encrypted document to verify BYOK logic
        await prisma.document.upsert({
            where: { id: 'DOC-SOV-ENCRYPTED' },
            update: { tenantId: tenantId! },
            create: {
                id: 'DOC-SOV-ENCRYPTED',
                name: 'Sovereign Acquisition Memo (Encrypted)',
                uri: 'local://vault/acme/memo_encrypted.pdf',
                jurisdiction: 'GH_ACC_1',
                matterId: 'MT-772',
                tenantId: tenantId!
            }
        });
        console.log('✅ Seeded Encrypted Mock Document');

        // Create AI usage audit logs
        console.log('🌱 Seeding AI usage audit logs...');
        await prisma.auditLog.createMany({
            data: [
                { action: 'AI_ACCESS_DRAFT', userId: counselId, details: 'Drafted NDA', matterId: 'MT-772', tenantId: tenantId! } as any,
                { action: 'AI_ACCESS_RESEARCH', userId: counselId, details: 'Researched merger laws', matterId: 'MT-772', tenantId: tenantId! } as any,
                { action: 'AI_OVERRIDE', userId: counselId, details: 'Overrode PII check for authorized partner', matterId: 'MT-772', tenantId: tenantId! } as any
            ]
        });

        // Create deadlines
        console.log('🌱 Seeding deadlines...');
        await (prisma as any).deadline.createMany({
            data: [
                { title: 'Merger Filing', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), status: 'PENDING', matterId: 'MT-772', tenantId: tenantId! },
                { title: 'Discovery Response', dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), status: 'PENDING', matterId: 'MT-881', tenantId: tenantId! }
            ]
        });

        // Pricing configs already upserted above

        // Regulatory Rules
        const rules = [
            { id: 'REG-001', name: 'GDPR Data Sovereignty', description: 'Ensure EU user data remains within EU enclaves.', region: 'EU', isActive: true, authority: 'EU Commission', triggerKeywords: ['personal data', 'eu citizen'], blockThreshold: 0.8 },
            { id: 'REG-002', name: 'CCPA Consumer Rights', description: 'Enforce right to deletion for CA residents.', region: 'US', isActive: true, authority: 'California State', triggerKeywords: ['california', 'consumer'], blockThreshold: 0.7 },
            { id: 'REG-003', name: 'Banking Secrecy Act', description: 'Flag transactions over $10k for review.', region: 'US', isActive: false, authority: 'FinCEN', triggerKeywords: ['transaction', 'structuring'], blockThreshold: 0.9 },
            // Jurisdictional Specific Rules
            { id: 'REG-SOV-001', name: 'Data Protection Act (Section A)', description: 'Mandates registration of data controllers and protects personal data.', region: 'GH_ACC_1', isActive: true, authority: 'Ghana Data Protection Commission', triggerKeywords: ['digital address', 'ghana card', 'voters id'], blockThreshold: 0.8 },
            { id: 'REG-SOV-002', name: 'POPIA Compliance Sentinel', description: 'Enforces Protection of Personal Information Act for South African subjects.', region: 'ZA_JNB_1', isActive: true, authority: 'Information Regulator (South Africa)', triggerKeywords: ['id number', 'biometric', 'account number', 'political persuasion'], blockThreshold: 0.85 },
            { id: 'REG-SOV-003', name: 'NDPR Data Privacy Framework', description: 'Nigeria Data Protection Regulation compliance layer.', region: 'NG_LOS_1', isActive: true, authority: 'NITDA', triggerKeywords: ['national identity number', 'nin', 'health data', 'bvnt'], blockThreshold: 0.8 },
            { id: 'REG-SOV-004', name: 'AML/CFT Africa Cluster', description: 'Anti-Money Laundering monitoring for regional suspicious transactions.', region: 'PRIMARY', isActive: true, authority: 'Financial Intelligence Centre', triggerKeywords: ['laundering', 'structuring', 'suspicious deposit', 'terrorist financing'], blockThreshold: 0.9 },
            // Industrial Specific Rules (Banking & Real Estate)
            { 
              id: 'REG-IND-BANK-001', 
              name: 'BOG Banking Act (Act 930)', 
              description: 'Enforces compliance with the Banks and Specialised Deposit-Taking Institutions Act, 2016 (Act 930) and BOG directives.', 
              region: 'GH_ACC_1', 
              isActive: true, 
              authority: 'Bank of Ghana', 
              triggerKeywords: ['deposit-taking', 'tier 1 capital', 'liquidity ratio', 'bog directive', 'exposure limit', 'act 930'], 
              blockThreshold: 0.85 
            },
            { 
              id: 'REG-IND-LAND-001', 
              name: 'Land Act 2020 (Act 1035)', 
              description: 'Mandates registration of land interests and governs allodial, usufructuary, and leasehold titles in Ghana.', 
              region: 'GH_ACC_1', 
              isActive: true, 
              authority: 'Lands Commission', 
              triggerKeywords: ['land act 2020', 'act 1035', 'stool land', 'skin land', 'customary memory', 'conveyance', 'allodial'], 
              blockThreshold: 0.8 
            }
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
# MASTER SERVICE AGREEMENT

**THIS SERVICE AGREEMENT** (the "Agreement") is made between **{{provider_name}}** (the "Provider") and **{{client_name}}** (the "Client") as of **{{start_date}}**.

### 1. Services Provided
Provider agrees to render the following professional services to Client: **{{service_description}}**. All services shall be performed with reasonable care and skill.

### 2. Payment & Fees
Client agrees to pay Provider according to the following schedule: **{{payment_terms}}**. Late payments shall accrue interest at a rate of 1.5% per month or the maximum rate permitted by law.

### 3. Intellectual Property
Upon full payment of all fees, the Provider hereby assigns to the Client all rights, title, and interest in and to the deliverables created under this Agreement. Any pre-existing intellectual property owned by the Provider shall remain the exclusive property of the Provider.

### 4. Confidentiality
Both parties agree to treat all business information, technical data, and trade secrets disclosed during the performance of this Agreement as confidential. This obligation shall survive for a period of three (3) years following termination.

### 5. Independent Contractor
Provider enters this Agreement as an independent contractor. Nothing in this Agreement creates a partnership, joint venture, or employer-employee relationship.

{{#if include_indemnification}}
### 6. Indemnification
Provider agrees to indemnify, defend, and hold harmless Client from any third-party claims arising out of Provider's gross negligence or willful misconduct in the performance of the services.
{{/if}}

### 7. Limitation of Liability
In no event shall either party's total liability under this Agreement exceed the total fees paid by the Client to the Provider during the twelve (12) months preceding the claim.

### 8. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction of **GLOBAL MARITIME STANDARDS**.

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
# EXECUTIVE EMPLOYMENT AGREEMENT

**THIS AGREEMENT** is made on **{{start_date}}** BETWEEN **{{company_name}}** (the "Employer") AND **{{employee_name}}** (the "Employee").

### 1. Position & Duties
The Employer employs the Employee in the position of **{{position_title}}**. The Employee shall perform such duties as are standard for this role and as assigned by the board.

### 2. Remuneration & Benefits
The Employee will receive a gross annual salary of **{{salary_amount}}**, payable in monthly installments. The Employee shall also be eligible for the Company's standard benefit package.

### 3. Probation Period
The first **{{probation_period_months}}** months of employment shall be a probationary period. During this time, either party may terminate this agreement with seven (7) days' notice.

### 4. Confidentiality & Non-Disclosure
The Employee agrees that during and after their employment, they will not disclose, use, or disseminate any trade secrets or confidential information belonging to the Employer.

{{#if include_ip_assignment}}
### 5. Intellectual Property Alignment
All work product, inventions, and logic created by the Employee during the course of employment shall be "work for hire" and belong exclusively to the Employer.
{{/if}}

### 6. Termination of Employment
Following the probation period, either party may terminate this agreement by providing thirty (30) days' written notice. The Employer may terminate this agreement immediately for "Cause."

### 7. Non-Competition
For a period of twelve (12) months following termination, the Employee shall not work for any direct competitor of the Employer within the agreed geographic region.

### 8. Entire Agreement
This document constitutes the entire agreement between the parties and supersedes all prior discussions or representations.

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

### 1. Objective & Scope
The parties share the common goal of **{{mutual_goal}}**. This MoU outlines the framework for cooperation to achieve this objective through shared resources and expertise.

### 2. Non-Binding Nature
Except for the provisions regarding Confidentiality and Governing Law, this MoU is not intended to create legal or binding obligations between the Parties.

{{#if include_confidentiality}}
### 3. Confidential Information
Both parties agree to use reasonable care to protect any proprietary information shared during the collaborative phase. No public announcements shall be made without mutual consent.
{{/if}}

### 4. Term and Termination
This MoU shall remain in effect for a period of twelve (12) months unless terminated earlier by either party with thirty (30) days' written notice.

### 5. Expenses
Each party shall bear its own costs and expenses incurred in connection with the activities contemplated by this MoU.

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
# FORMAL DEMAND & NOTICE OF DISPUTE

**DATE:** {{deadline_date}}

**TO:** {{recipient_name}}

**FROM:** {{sender_name}}

**RE: FORMAL DEMAND FOR PAYMENT / NOTICE OF BREACH**

Dear Sir/Madam,

This letter serves as a formal demand regarding **{{breach_details}}**. We have identified a significant failure to perform under the agreed terms, causing material damage to our operations.

### 1. Statement of Claim
Our records indicate that the outstanding amount of **{{amount_due}}** remains unpaid despite previous informal requests. This constitutes a material breach of the underlying agreement.

### 2. Proposed Resolution
You are hereby required to cure this breach by paying the total outstanding amount of **{{amount_due}}** no later than **{{deadline_date}}**. 

### 3. Reservation of Rights
Failure to comply with this demand by the stated deadline will result in the immediate commencement of legal proceedings without further notice. We reserve all rights to seek damages, interest, and legal costs to the fullest extent permitted by law.

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

**THIS LEASE AGREEMENT** (the "Lease") is made between **{{landlord_name}}** (the "Landlord") and **{{tenant_name}}** (the "Tenant") as of the date of final signature.

### 1. Demised Property
The Landlord hereby leases to the Tenant the property located at: **{{property_address}}** (the "Property"), for use as a private residence only.

### 2. Term & Possession
The term of this lease shall be for **{{lease_term_months}}** months, commencing on the date of execution. Possession shall be delivered to the Tenant upon receipt of the first month's rent and security deposit.

### 3. Rent & Payments
The monthly rent is **{{monthly_rent}}**, payable in advance on the first day of each calendar month. Late payments received after the 5th day of the month shall be subject to a late fee of 5% of the monthly rent.

### 4. Security Deposit
The Tenant shall provide a security deposit equivalent to one month's rent. This deposit shall be held by the Landlord as security for the faithful performance of the lease terms and shall be returned, less any lawful deductions, within 30 days of termination.

### 5. Maintenance and Repair
The Tenant shall keep the Property in a clean and sanitary condition. The Landlord remains responsible for major structural repairs, plumbing, electrical, and the maintenance of essential services. The Tenant is responsible for minor repairs and any damage caused by negligence.

{{#if include_pets_clause}}
### 6. Pet Provision
The Landlord consents to the Tenant keeping domestic pets on the Property, subject to a non-refundable pet cleaning fee of $250. The Tenant remains strictly liable for any damage caused by such pets.
{{/if}}

### 7. Quiet Enjoyment
The Landlord covenants that the Tenant, upon paying the rent and performing the covenants, shall peacefully and quietly have, hold, and enjoy the Property during the term of this Lease.

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
                
                // Synthesize content from clauses if missing (for structured templates)
                let synthesizedContent = templateData.content || '';
                if (!synthesizedContent && templateData.clauses) {
                    synthesizedContent = templateData.clauses.map((c: any) => {
                        return `### ${c.clause_title || c.title || 'Clause'}\n${c.clause_text || c.text || ''}`;
                    }).join('\n\n');
                }

                await prisma.documentTemplate.upsert({
                    where: { id: file.replace('.json', '') },
                    update: {
                        name: templateData.name || templateData.template_name || file.replace('.json', ''),
                        description: templateData.description || `${templateData.category || 'Standard'} Template`,
                        category: templateData.category || 'GENERAL',
                        jurisdiction: templateData.jurisdiction || 'GLOBAL',
                        content: synthesizedContent,
                        structure: templateData.clauses || templateData.structure || { fields: [], sections: [] },
                        version: templateData.version || '1.0.0'
                    },
                    create: {
                        id: file.replace('.json', ''),
                        name: templateData.name || templateData.template_name || file.replace('.json', ''),
                        description: templateData.description || `${templateData.category || 'Standard'} Template`,
                        category: templateData.category || 'GENERAL',
                        jurisdiction: templateData.jurisdiction || 'GLOBAL',
                        content: synthesizedContent,
                        structure: templateData.clauses || templateData.structure || { fields: [], sections: [] },
                        version: templateData.version || '1.0.0'
                    }
                });
                console.log(`   - Seeded Dynamic Template: ${templateData.name || templateData.template_name}`);
            }
        }

        // === Clause Library Seeding ===
        console.log('🌱 Seeding Clause Library Engine...');
        const CLAUSES = [
            { id: 'CL-NDA-001', title: 'Mutual Non-Disclosure (Standard)', category: 'NDA', jurisdiction: 'GLOBAL', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Each party agrees to maintain the confidentiality of the Proprietary Information disclosed by the other party with at least the same degree of care as it uses to protect its own confidential information, but in no event less than reasonable care.' }] }] }, tags: ['confidentiality', 'disclosure', 'mutual'], isGlobal: true },
            { id: 'CL-FM-001', title: 'Force Majeure (Broad)', category: 'Boilerplate', jurisdiction: 'GLOBAL', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Neither party shall be liable for any failure or delay in performance under this Agreement (other than for delay in the payment of money due and payable hereunder) for causes beyond that party’s reasonable control and occurring without that party’s fault or negligence, including, but not limited to, acts of God, fire, pandemic, or government action.' }] }] }, tags: ['boilerlate', 'risk', 'excuse'], isGlobal: true },
            { id: 'CL-IND-001', title: 'Indemnity (Mutual)', category: 'Indemnity', jurisdiction: 'GLOBAL', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Each party (the "Indemnifying Party") shall indemnify, defend and hold harmless the other party (the "Indemnified Party") from and against any and all losses, damages, liabilities, costs and expenses arising out of any third-party claim relating to the Indemnifying Party’s gross negligence or willful misconduct.' }] }] }, tags: ['liability', 'protection', 'mutual'], isGlobal: true },
            { id: 'CL-TERM-001', title: 'Termination for Convenience', category: 'Termination', jurisdiction: 'GLOBAL', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Either party may terminate this Agreement at any time, for any reason or no reason, by providing at least thirty (30) days prior written notice to the other party.' }] }] }, tags: ['exit', 'notice', 'flexibility'], isGlobal: true },
            { id: 'CL-GOV-LAW-001', title: 'Governing Law (Ghana)', category: 'Governance', jurisdiction: 'GH_ACC_1', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This Agreement and any dispute or claim arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the laws of the Republic of Ghana.' }] }] }, tags: ['jurisdiction', 'ghana', 'legal'], isGlobal: true },
            { id: 'CL-CONF-001', title: 'Confidentiality (Survival)', category: 'NDA', jurisdiction: 'GLOBAL', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The obligations of confidentiality set forth in this Section shall survive the expiration or termination of this Agreement for a period of three (3) years.' }] }] }, tags: ['survival', 'duration', 'confidentiality'], isGlobal: true }
        ];

        for (const c of CLAUSES) {
            await prisma.clause.upsert({
                where: { id: c.id },
                update: { title: c.title, category: c.category, jurisdiction: c.jurisdiction, content: c.content as any, tags: c.tags, isGlobal: c.isGlobal },
                create: { id: c.id, title: c.title, category: c.category, jurisdiction: c.jurisdiction, content: c.content as any, tags: c.tags, isGlobal: c.isGlobal }
            });
            console.log(`   - Seeded Clause: ${c.title}`);
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
