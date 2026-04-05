import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceSync() {
    const DEMO_EMAILS = ['clerk@nomosdesk.com', 'admin_manager@nomosdesk.com', 'counsel@nomosdesk.com'];

    for (const email of DEMO_EMAILS) {
        const result = await prisma.user.updateMany({
            where: { email },
            // @ts-ignore
            data: { firebaseUid: `fb-${email.split('@')[0]}-demo` }
        });
        console.log(`Synced identity for ${email}: ${result.count} row(s) updated`);
    }

    // Verify
    const users = await prisma.user.findMany({
        where: { email: { in: DEMO_EMAILS } }
    });

    for (const user of users) {
        // @ts-ignore
        const exists = !!user.firebaseUid;
        console.log(`Verify ${user.email}: ${exists ? '✅ SYNCED' : '❌ MISSING'}`);
    }

    process.exit(0);
}

forceSync().catch(e => {
    console.error(e);
    process.exit(1);
});
