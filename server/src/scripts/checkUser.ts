import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'tawia@shongbenjamin.com';
    console.log(`Querying for user: ${email}`);
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true,
            tenant: true
        }
    });

    if (user) {
        console.log('User found:');
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log('User NOT found.');
    }

    const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, roleString: true, tenantId: true }
    });
    console.log('All Users:', allUsers);

    const allTenants = await prisma.tenant.findMany();
    console.log('All Tenants:', allTenants);

    const allRoles = await prisma.role.findMany({
        select: { id: true, name: true, isSystem: true, tenantId: true }
    });
    console.log('All Roles:', allRoles);

    process.exit(0);
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
