import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Admin Manager Demo Data...');

    const adminEmail = 'admin_manager@nomosdesk.com';
    const password = 'password123';
    const region = 'GH_ACC_1';

    // 1. Find or Create Tenant
    let tenant = await prisma.tenant.findFirst({ where: { name: 'NomosDesk Demo' } });
    if (!tenant) {
        console.log('Creating Tenant...');
        tenant = await prisma.tenant.create({
            data: {
                name: 'NomosDesk Demo',
                plan: 'ENTERPRISE',
                primaryRegion: region,
                appMode: 'LAW_FIRM'
            }
        });
    }
    const tenantId = tenant.id;

    // 2. Find or Create Admin Manager Role (if not existing)
    // Note: seed.ts already creates this, but let's be safe for standalone use
    let adminManagerRole = await prisma.role.findFirst({ where: { name: 'ADMIN_MANAGER', tenantId: null } });
    if (!adminManagerRole) {
        console.log('Creating Admin Manager Role...');
        adminManagerRole = await prisma.role.create({
            data: {
                name: 'ADMIN_MANAGER',
                description: 'Office & Personnel Management',
                isSystem: true,
                permissions: {
                    connect: [
                        { id: 'read_billing' }, { id: 'approve_spend' }, { id: 'manage_users' },
                        { id: 'use_legal_chat' }, { id: 'view_confidential' }
                    ]
                }
            }
        });
    }

    // 3. Create Admin Manager User
    console.log('Upserting Admin Manager User...');
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            // @ts-ignore
            firebaseUid: 'fb-admin-manager-demo',
            roleString: 'ADMIN_MANAGER',
            roleId: adminManagerRole.id
        },
        create: {
            email: adminEmail,
            name: 'Kofi Mensah (Admin Manager)',
            // @ts-ignore
            firebaseUid: 'fb-admin-manager-demo',
            tenantId: tenantId,
            roleId: adminManagerRole.id,
            roleString: 'ADMIN_MANAGER',
            region: region,
            roleSeniority: 5.0
        }
    });

    // 4. Create managed staff for the demo
    console.log('Seeding Staff Members...');
    const staffData = [
        { email: 'ama.mensah@nomosdesk.com', name: 'Ama Mensah', role: 'JUNIOR_ASSOCIATE' },
        { email: 'kwame.addo@nomosdesk.com', name: 'Kwame Addo', role: 'SENIOR_COUNSEL' },
        { email: 'yaba.asante@nomosdesk.com', name: 'Yaba Asante', role: 'INTERNAL_COUNSEL' }
    ];

    const staffUsers = [];
    for (const s of staffData) {
        const u = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                email: s.email,
                name: s.name,
                // @ts-ignore
                firebaseUid: `fb-staff-${s.email}`,
                tenantId: tenantId,
                roleString: s.role,
                region: region,
                roleSeniority: 2.0
            }
        });
        staffUsers.push(u);
    }

    // 5. Seed HR Data (Leaves)
    console.log('Seeding Leave Records...');
    await prisma.leaveRecord.createMany({
        data: [
            { userId: staffUsers[0].id, tenantId, type: 'Annual', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-10'), status: 'Approved', reason: 'Family vacation' },
            { userId: staffUsers[1].id, tenantId, type: 'Sick', startDate: new Date('2026-03-05'), endDate: new Date('2026-03-06'), status: 'Approved', reason: 'Flu' },
            { userId: staffUsers[2].id, tenantId, type: 'Maternity', startDate: new Date('2026-06-01'), endDate: new Date('2026-09-01'), status: 'Pending', reason: 'Expecting' }
        ],
        skipDuplicates: true
    });

    // 6. Seed Assets
    console.log('Seeding Assets...');
    await prisma.firmAsset.createMany({
        data: [
            { tenantId, name: 'MacBook Pro 16"', serialNumber: 'MBP-2026-001', category: 'Laptop', status: 'Assigned', assignedToId: staffUsers[1].id, purchaseDate: new Date('2025-01-10'), notes: 'High performance for senior counsel' },
            { tenantId, name: 'iPad Pro 12.9"', serialNumber: 'IPD-2026-012', category: 'Tablet', status: 'In Stock', purchaseDate: new Date('2025-11-20'), notes: 'Client presentation unit' },
            { tenantId, name: 'Dell UltraSharp 27"', serialNumber: 'DEL-2026-045', category: 'Monitor', status: 'Assigned', assignedToId: staffUsers[0].id, purchaseDate: new Date('2026-02-15') }
        ],
        skipDuplicates: true
    });

    // 7. Seed Expenses
    console.log('Seeding Expenses...');
    await prisma.expense.createMany({
        data: [
            { tenantId, description: 'Office Electricity - March 2026', amount: 1200.50, category: 'Utilities', status: 'Pending', expenseDate: new Date(), type: 'UTILITY' },
            { tenantId, description: 'Client Coffee & Snacks', amount: 150.00, category: 'Petty Cash', status: 'Paid', expenseDate: new Date(), type: 'PETTY_CASH', notes: 'Lunch meeting with Acme Corp' },
            { tenantId, description: 'Internet Fiber Subscription', amount: 800.00, category: 'Utilities', status: 'Paid', expenseDate: new Date('2026-02-28'), type: 'UTILITY' }
        ],
        skipDuplicates: true
    });

    // 8. Seed Recruitment (Candidates)
    console.log('Seeding Candidates...');
    await prisma.candidate.createMany({
        data: [
            { tenantId, name: 'John Doe', email: 'john.doe@example.com', role: 'Litigation Associate', status: 'Interviewed', appliedOn: new Date('2026-03-01') },
            { tenantId, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Corporate Counsel', status: 'Offered', appliedOn: new Date('2026-02-15') }
        ],
        skipDuplicates: true
    });

    // 9. Seed Onboarding
    console.log('Seeding Onboarding Items...');
    await prisma.onboardingItem.createMany({
        data: [
            { tenantId, task: 'Provide workstation & ID badge', isCompleted: true, role: 'Operations' },
            { tenantId, task: 'KYC & Background check', isCompleted: false, role: 'Compliance' },
            { tenantId, task: 'Email & Enclave access setup', isCompleted: true, role: 'IT' }
        ],
        skipDuplicates: true
    });

    // 10. Seed CLE Records
    console.log('Seeding CLE Records...');
    await prisma.cLERecord.createMany({
        data: [
            { userId: staffUsers[0].id, tenantId, course: 'Ethics in AI Law', credits: 5, date: new Date('2026-01-20'), deadline: new Date('2026-12-31') },
            { userId: staffUsers[1].id, tenantId, course: 'Advanced Maritime Litigation', credits: 8, date: new Date('2026-02-10'), deadline: new Date('2026-12-31') }
        ],
        skipDuplicates: true
    });

    // 11. Seed Salary Records (Payroll)
    console.log('Seeding Salary Records...');
    for (const u of staffUsers) {
        await prisma.salaryRecord.create({
            data: {
                userId: u.id,
                tenantId,
                baseSalary: 15000 + (Math.random() * 10000),
                bankAccount: `GH-BARB-${Math.floor(10000000 + Math.random() * 90000000)}`,
                effectiveFrom: new Date('2026-01-01')
            }
        });
    }

    // 12. Seed Performance Appraisals
    console.log('Seeding Performance Appraisals...');
    await prisma.performanceAppraisal.createMany({
        data: [
            { userId: staffUsers[0].id, tenantId, date: new Date('2026-02-01'), rating: 'Exceeds Expectations', reviewerId: adminUser.id, notes: 'Ama has shown great initiative in the project enclave.' },
            { userId: staffUsers[1].id, tenantId, date: new Date('2026-01-15'), rating: 'Strong Performer', reviewerId: adminUser.id, notes: 'Steady performance and good leadership.' }
        ],
        skipDuplicates: true
    });

    console.log('\n🌟 ADMIN MANAGER DEMO READY 🌟');
    console.log('-----------------------------------');
    console.log(`ACCOUNT: ${adminEmail} / ${password}`);
    console.log('-----------------------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
