import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log('Users:', users.map(u => ({
        email: u.email,
        roleString: u.roleString,
        roleName: u.role?.name,
        roleId: u.roleId,
        hasPassword: !!u.passwordHash
    })));

    const roles = await prisma.role.findMany();
    console.log('Available Roles:', roles.map(r => ({ name: r.name, id: r.id, tenantId: r.tenantId })));
    process.exit(0);
}

check();
