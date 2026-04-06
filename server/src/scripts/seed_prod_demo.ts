import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// This script targets the DATABASE_URL env var - set it to production before running
const prisma = new PrismaClient();

async function seedProdDemoAccounts() {
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('DATABASE_URL:', (process.env.DATABASE_URL || '').replace(/:[^@]+@/, ':***@'));

    // Find the tenant to associate with
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@nomosdesk.com' } });
    if (!adminUser?.tenantId) {
        console.error('❌ Cannot find admin user or tenant. Aborting.');
        process.exit(1);
    }
    const tenantId = adminUser.tenantId;
    console.log('Using tenantId:', tenantId);

    // Find or create CLERK role
    let clerkRole = await prisma.role.findFirst({ where: { name: 'CLERK' } });
    if (!clerkRole) {
        clerkRole = await prisma.role.create({ data: { name: 'CLERK', isSystem: true } });
        console.log('✅ Created CLERK role');
    } else {
        console.log('ℹ️ CLERK role already exists');
    }

    // Find or create ADMIN_MANAGER role
    let adminManagerRole = await prisma.role.findFirst({ where: { name: 'ADMIN_MANAGER' } });
    if (!adminManagerRole) {
        adminManagerRole = await prisma.role.create({ data: { name: 'ADMIN_MANAGER', isSystem: true } });
        console.log('✅ Created ADMIN_MANAGER role');
    } else {
        console.log('ℹ️ ADMIN_MANAGER role already exists');
    }

    // Upsert Clerk
    const clerk = await prisma.user.upsert({
        where: { email: 'clerk@nomosdesk.com' },
        update: { 
            passwordHash,
            roleId: clerkRole.id, 
            roleString: 'CLERK', 
            name: 'Firm Clerk' 
        },
        create: {
            email: 'clerk@nomosdesk.com',
            passwordHash,
            name: 'Firm Clerk',
            roleId: clerkRole.id,
            roleString: 'CLERK',
            region: 'GH_ACC_1',
            tenantId,
            jurisdictionPins: ['GH_ACC_1'],
        }
    });
    console.log('✅ Upserted clerk:', clerk.email);

    // Upsert Admin Manager
    const adminManager = await prisma.user.upsert({
        where: { email: 'admin_manager@nomosdesk.com' },
        update: { 
            passwordHash,
            roleId: adminManagerRole.id, 
            roleString: 'ADMIN_MANAGER', 
            name: 'Firm Admin Manager' 
        },
        create: {
            email: 'admin_manager@nomosdesk.com',
            passwordHash,
            name: 'Firm Admin Manager',
            roleId: adminManagerRole.id,
            roleString: 'ADMIN_MANAGER',
            region: 'GH_ACC_1',
            tenantId,
            jurisdictionPins: ['GH_ACC_1'],
        }
    });
    console.log('✅ Upserted admin_manager:', adminManager.email);

    // Verify
    console.log(`\n🔐 Provisioning: clerk: ✅ OK | admin_manager: ✅ OK`);

    process.exit(0);
}

seedProdDemoAccounts().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
