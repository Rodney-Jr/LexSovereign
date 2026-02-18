
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DETAILED ADMIN CHECK ---');
    const user = await prisma.user.findUnique({
        where: { email: 'admin@nomosdesk.com' },
        include: { role: { include: { permissions: true } } }
    });

    if (!user) {
        console.log('User admin@nomosdesk.com NOT FOUND');
    } else {
        console.log('User found:');
        console.log(`  ID: "${user.id}"`);
        console.log(`  Email: "${user.email}"`);
        console.log(`  RoleString: "${user.roleString}"`);
        console.log(`  TenantId: "${user.tenantId}"`);
        if (user.role) {
            console.log('  Role Object:');
            console.log(`    Role ID: "${user.role.id}"`);
            console.log(`    Role Name: "${user.role.name}"`);
            console.log(`    Is System: ${user.role.isSystem}`);
            console.log(`    TenantId: "${user.role.tenantId}"`);
            console.log(`    Permissions: ${user.role.permissions.map(p => p.id).join(', ')}`);
        } else {
            console.log('  Role Object: NULL');
        }
    }

    console.log('\n--- ALL GLOBAL_ADMIN ROLES ---');
    const roles = await prisma.role.findMany({
        where: { name: 'GLOBAL_ADMIN' }
    });
    roles.forEach(r => {
        console.log(`- ID: "${r.id}", Name: "${r.name}", TenantId: "${r.tenantId}", IsSystem: ${r.isSystem}`);
    });

    await prisma.$disconnect();
}

main();
