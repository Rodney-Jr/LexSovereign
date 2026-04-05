import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepCheck() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const user = await prisma.user.findUnique({
        where: { email: 'clerk@nomosdesk.com' },
        include: { role: true, tenant: true }
    });

    if (!user) {
        console.log('❌ User NOT FOUND in database');
        process.exit(1);
    }

    console.log('✅ Found user:', {
        id: user.id,
        email: user.email,
        roleString: user.roleString,
        roleName: user.role?.name,
        tenantId: user.tenantId,
        tenantName: (user as any).tenant?.name,
        // @ts-ignore
        firebaseUid: user.firebaseUid
    });

    // @ts-ignore
    console.log(`Firebase UID present: ${user.firebaseUid ? '✅ YES' : '❌ NO'}`);

    process.exit(0);
}

deepCheck().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
