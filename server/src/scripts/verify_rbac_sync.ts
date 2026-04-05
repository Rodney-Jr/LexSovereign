import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { prisma } from '../db';

async function verifyRbacSync() {
    const email = 'thrive.rodney@gmail.com';
    console.log(`\n========== FIREBASE ↔ RBAC SYNC VERIFICATION ==========`);
    console.log(`Target: ${email}\n`);

    const user = await (prisma as any).user.findUnique({
        where: { email },
        include: {
            role: { include: { permissions: true } },
            tenant: true
        }
    });

    if (!user) {
        console.error('❌ CRITICAL: User not found in database!');
        process.exit(1);
    }

    // 1. Firebase UID check
    const hasFirebaseUid = user.firebaseUid && !user.firebaseUid.startsWith('legacy-');
    console.log(`1. Firebase UID Linked:     ${hasFirebaseUid ? '✅' : '❌'} ${user.firebaseUid || 'MISSING'}`);
    if (user.firebaseUid?.startsWith('legacy-')) {
        console.log(`   ⚠  WARNING: This is a placeholder UID. User must re-login via Firebase to update it.`);
    }

    // 2. Role check
    console.log(`2. roleString:              ${user.roleString ? '✅' : '❌'} ${user.roleString || 'NOT SET'}`);

    // 3. Role record check (FK)
    console.log(`3. Role FK (roleId):        ${user.roleId ? '✅' : '❌'} ${user.roleId || 'NOT SET'}`);
    console.log(`   Role Name (from join):   ${user.role ? '✅ ' + user.role.name : '❌ No role record joined'}`);

    // 4. Permissions check
    const perms = user.role?.permissions || [];
    console.log(`4. Permissions Loaded:      ${perms.length > 0 ? '✅' : '⚠ '} ${perms.length} permission(s)`);
    if (perms.length > 0) {
        perms.slice(0, 5).forEach((p: any) => {
            console.log(`   - ${p.action} on ${p.resource}`);
        });
        if (perms.length > 5) console.log(`   ... and ${perms.length - 5} more`);
    }

    // 5. Tenant check (Global Admin should have null)
    const tenantOk = user.tenantId === null;
    console.log(`5. tenantId (null=GA):      ${tenantOk ? '✅' : '⚠ '} ${user.tenantId || 'null (correct for Global Admin)'}`);

    // 6. isActive check
    console.log(`6. isActive:                ${user.isActive ? '✅' : '❌'} ${user.isActive}`);

    // 7. RBAC bypass check - does GLOBAL_ADMIN role exist in system?
    const globalAdminRole = await (prisma as any).role.findFirst({
        where: { name: 'GLOBAL_ADMIN', isSystem: true },
        include: { permissions: true }
    });
    console.log(`7. GLOBAL_ADMIN system role: ${globalAdminRole ? '✅' : '❌'} ${globalAdminRole ? `found (id: ${globalAdminRole.id})` : 'MISSING - run seed'}`);
    if (globalAdminRole) {
        console.log(`   Permissions on role:     ${globalAdminRole.permissions.length}`);
    }

    // 8. Summary
    console.log(`\n========== SUMMARY ==========`);
    const issues = [];
    if (!hasFirebaseUid) issues.push('Firebase UID not set or is a placeholder');
    if (!user.roleString) issues.push('roleString not set');
    if (!user.roleId) issues.push('roleId FK not set');
    if (!user.role) issues.push('Role record not joined (roleId may be incorrect)');
    if (!user.isActive) issues.push('User is inactive');
    if (!globalAdminRole) issues.push('GLOBAL_ADMIN system role missing from database');

    if (issues.length === 0) {
        console.log('✅ All checks passed. Firebase Auth is fully synced with the RBAC system.');
    } else {
        console.log('⚠  Issues found:');
        issues.forEach(i => console.log(`   - ${i}`));
    }

    await prisma.$disconnect();
}

verifyRbacSync().catch(e => { console.error(e); process.exit(1); });
