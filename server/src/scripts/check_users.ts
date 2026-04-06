import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        include: { role: true, tenant: true }
    });
    console.log('Users:', users.map((user: any) => ({
        email: user.email,
        roleString: user.roleString,
        tenantName: user.tenant?.name,
        hasPasswordHash: !!user.passwordHash
    })));

    for (const user of users) {
        console.log(`User ${user.email} - Password Hash present: ${user.passwordHash ? '✅ YES' : '❌ NO'}`);
    }

    const roles = await prisma.role.findMany();
    console.log('Available Roles:', roles.map(r => ({ name: r.name, id: r.id, tenantId: r.tenantId })));
    process.exit(0);
}

check();
