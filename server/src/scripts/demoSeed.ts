import { prisma } from '../db';
import bcrypt from 'bcryptjs';
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
                appMode: 'LAW_FIRM'
            }
        });

        // 2. Create Roles
        console.log('Creating Roles...');
        const partnerRole = await prisma.role.create({
            data: {
                name: 'PARTNER',
                description: 'Senior Management & Legal Counsel',
                isSystem: true,
                tenantId: tenantId,
                permissions: {
                    connect: [
                        { id: 'manage_tenant' }, { id: 'manage_users' }, { id: 'manage_roles' },
                        { id: 'read_billing' }, { id: 'read_all_audits' }, { id: 'create_matter' },
                        { id: 'read_assigned_matter' }, { id: 'check_conflicts' }, { id: 'review_work' },
                        { id: 'upload_document' }, { id: 'create_draft' }, { id: 'edit_draft' },
                        { id: 'approve_document' }, { id: 'export_final' }, { id: 'ai_chat_execute' },
                        { id: 'use_legal_chat' }, { id: 'view_confidential' }
                    ]
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
                        { id: 'read_assigned_matter' }, { id: 'check_conflicts' }, { id: 'upload_document' },
                        { id: 'create_draft' }, { id: 'edit_draft' }, { id: 'submit_review' },
                        { id: 'create_matter' }, { id: 'ai_chat_execute' }, { id: 'use_legal_chat' },
                        { id: 'view_confidential' }
                    ]
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
                        { id: 'read_assigned_matter' }, { id: 'client_portal_access' }
                    ]
                }
            }
        });

        // 3. Create Admin (Partner) User
        console.log('Creating Admin Partner...');
        const hashedPartnerPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                id: adminId,
                email: adminEmail,
                name: 'Senior Partner',
                passwordHash: hashedPartnerPassword,
                tenantId: tenantId,
                roleId: partnerRole.id,
                roleString: 'PARTNER',
                region: region,
                roleSeniority: 10.0
            }
        });

        // 4. Create associate
        console.log('Creating Associate...');
        const hashedAssociatePassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email: 'associate@enterpriselegal.com',
                passwordHash: hashedAssociatePassword,
                name: 'Demo Associate',
                roleId: associateRole.id,
                roleString: 'JUNIOR_ASSOCIATE',
                region: region,
                tenantId: tenantId
            }
        });

        // 5. Create client
        console.log('Creating Client...');
        const hashedClientPassword = await bcrypt.hash(password, 10);
        const clientUser = await prisma.user.create({
            data: {
                email: 'client@enterpriselegal.com',
                passwordHash: hashedClientPassword,
                name: 'Demo Client (Acme Corp)',
                roleId: clientRole.id,
                roleString: 'CLIENT',
                region: region,
                tenantId: tenantId
            }
        });

        // 6. Create Showcase Matter
        console.log('Creating Matter...');
        const matter = await prisma.matter.create({
            data: {
                id: 'ENT-DEMO-001',
                name: 'M&A: Project Phoenix Acquisition',
                client: 'Acme Corp',
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
        console.log('PARTNER: partner@enterpriselegal.com / password123');
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
