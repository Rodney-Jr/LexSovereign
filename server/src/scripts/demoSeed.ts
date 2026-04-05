import { prisma } from '../db';
import { randomUUID } from 'crypto';

async function main() {
    console.log('🌱 Manual Provisioning "Enterprise Legal" Demo Tenant...');

    const tenantName = 'Enterprise Legal';
    const adminEmail = 'partner@enterpriselegal.com';
    const password = 'password123';
    const tenantId = randomUUID();
    const adminId = randomUUID();
    const region = 'GH_ACC_1';

    // Check if admin user already exists (using a more robust check)
    const existingAdmin = await prisma.user.findFirst({ where: { email: adminEmail } });
    if (existingAdmin) {
        console.log('ℹ️ Demo tenant already exists (admin email found). Skipping.');
        return;
    }

    try {
        // 1. Create Tenant
        console.log('Creating Tenant...');
        await prisma.tenant.create({
            data: {
                id: tenantId,
                name: tenantName,
                plan: 'ENTERPRISE',
                primaryRegion: region,
                appMode: 'LAW_FIRM',
                enabledModules: ['CORE', 'ACCOUNTING_HUB', 'HR_ENTERPRISE']
            }
        });

        // 2. Create Roles
        console.log('Creating Roles...');

        // Base Partner permissions plus new granular modules
        const adminPermissions = [
            'manage_tenant', 'manage_users', 'manage_roles',
            'read_billing', 'read_all_audits', 'create_matter',
            'read_assigned_matter', 'check_conflicts', 'review_work',
            'upload_document', 'create_draft', 'edit_draft',
            'approve_document', 'export_final', 'ai_chat_execute',
            'use_legal_chat', 'view_confidential',
            'access_hr_workbench', 'access_accounting_hub', 
            'access_platform_roadmap', 'access_infrastructure_plane', 'view_trial_status'
        ];

        const ownerRole = await prisma.role.create({
            data: {
                name: 'OWNER',
                description: 'Firm Owner - Full Sovereignty',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: adminPermissions.map(id => ({ id }))
                }
            }
        });

        const managingPartnerRole = await prisma.role.create({
            data: {
                name: 'MANAGING_PARTNER',
                description: 'Managing Partner - Executive Operations',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: adminPermissions.map(id => ({ id }))
                }
            }
        });

        const adminManagerRole = await prisma.role.create({
            data: {
                name: 'ADMIN_MANAGER',
                description: 'Administrative Manager - Firm Operations',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: [
                        'manage_users', 'manage_roles', 'read_billing', 
                        'access_hr_workbench', 'access_accounting_hub',
                        'access_platform_roadmap', 'view_trial_status',
                        'manage_tenant'
                    ].map(id => ({ id }))
                }
            }
        });

        const associateRole = await prisma.role.create({
            data: {
                name: 'JUNIOR_ASSOCIATE',
                description: 'Firm Associate',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: [
                        'read_assigned_matter', 'check_conflicts', 'upload_document',
                        'create_draft', 'edit_draft', 'submit_review',
                        'create_matter', 'ai_chat_execute', 'use_legal_chat',
                        'view_confidential'
                    ].map(id => ({ id }))
                }
            }
        });

        const clientRole = await prisma.role.create({
            data: {
                name: 'CLIENT',
                description: 'External Client Access',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: [
                        'read_assigned_matter', 'client_portal_access'
                    ].map(id => ({ id }))
                }
            }
        });

        // 3. Create Users
        console.log('Creating Admin Users...');
        
        // Owner
        await prisma.user.create({
            data: {
                email: 'owner@enterpriselegal.com',
                name: 'Firm Owner',
                // @ts-ignore
                firebaseUid: 'fb-owner-enterprise',
                tenantId: tenantId,
                roleId: ownerRole.id,
                roleString: 'OWNER',
                region: region,
                roleSeniority: 10.0
            }
        });

        // Managing Partner
        await prisma.user.create({
            data: {
                id: adminId,
                email: adminEmail,
                name: 'Senior Managing Partner',
                // @ts-ignore
                firebaseUid: 'fb-partner-enterprise',
                tenantId: tenantId,
                roleId: managingPartnerRole.id,
                roleString: 'MANAGING_PARTNER',
                region: region,
                roleSeniority: 9.0
            }
        });

        // Admin Manager
        await prisma.user.create({
            data: {
                email: 'admin@enterpriselegal.com',
                name: 'Admin Manager',
                // @ts-ignore
                firebaseUid: 'fb-admin-enterprise',
                tenantId: tenantId,
                roleId: adminManagerRole.id,
                roleString: 'ADMIN_MANAGER',
                region: region,
                roleSeniority: 5.0
            }
        });

        // 4. Create associate
        console.log('Creating Associate...');
        await prisma.user.create({
            data: {
                email: 'associate@enterpriselegal.com',
                // @ts-ignore
                firebaseUid: 'fb-associate-enterprise',
                name: 'Demo Associate',
                roleId: associateRole.id,
                roleString: 'JUNIOR_ASSOCIATE',
                region: region,
                tenantId: tenantId
            }
        });

        // 5. Create client
        console.log('Creating Client...');
        const clientUser = await prisma.user.create({
            data: {
                email: 'client@enterpriselegal.com',
                // @ts-ignore
                firebaseUid: 'fb-client-enterprise',
                name: 'Demo Client (Acme Corp)',
                roleId: clientRole.id,
                roleString: 'CLIENT',
                region: region,
                tenantId: tenantId
            }
        });

        // 6. Create Showcase Matter
        console.log('Creating Matter...');
        const clientRecord = await prisma.client.create({
            data: { name: 'Acme Corp', tenantId: tenantId }
        });

        const matter = await prisma.matter.create({
            data: {
                id: 'ENT-DEMO-001',
                name: 'M&A: Project Phoenix Acquisition',
                clientId: clientRecord.id,
                type: 'M&A',
                status: 'OPEN',
                riskLevel: 'HIGH',
                tenantId: tenantId,
                internalCounselId: adminId
            }
        });

        // 7. Seed Collaboration Hub
        console.log('Seeding Chat...');
        await prisma.collaborationMessage.createMany({
            data: [
                {
                    text: 'Welcome to the secure project enclave. We have uploaded the preliminary due diligence report for your review.',
                    authorId: adminId,
                    matterId: matter.id,
                    tenantId: tenantId,
                    isRead: true
                },
                {
                    text: 'Thank you for the update. My team is reviewing the IP section now.',
                    authorId: clientUser.id,
                    matterId: matter.id,
                    tenantId: tenantId,
                    isRead: false
                }
            ]
        });

        console.log('\n🌟 ENTERPRISE LEGAL DEMO READY 🌟');
        console.log('-----------------------------------');
        console.log('OWNER: owner@enterpriselegal.com / password123');
        console.log('MANAGING PARTNER: partner@enterpriselegal.com / password123');
        console.log('ADMIN MANAGER: admin@enterpriselegal.com / password123');
        console.log('ASSOCIATE: associate@enterpriselegal.com / password123');
        console.log('CLIENT: client@enterpriselegal.com / password123');
        console.log('-----------------------------------');

    } catch (err) {
        console.error('❌ Manual demo seeding failed:', err);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
