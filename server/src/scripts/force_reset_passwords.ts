import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function forceReset() {
    const DEMO_EMAILS = ['clerk@nomosdesk.com', 'admin_manager@nomosdesk.com', 'counsel@nomosdesk.com'];
    const newHash = await bcrypt.hash('password123', 12);

    console.log('New hash generated:', newHash.substring(0, 10) + '...');

    for (const email of DEMO_EMAILS) {
        const result = await prisma.user.updateMany({
            where: { email },
            data: { passwordHash: newHash }
        });
        console.log(`Reset password for ${email}: ${result.count} row(s) updated`);
    }

    // Verify
    const users = await prisma.user.findMany({
        where: { email: { in: DEMO_EMAILS } }
    });

    for (const user of users) {
        const match = await bcrypt.compare('password123', user.passwordHash!);
        console.log(`Verify ${user.email}: ${match ? '✅ MATCH' : '❌ FAIL'}`);
    }

    process.exit(0);
}

forceReset().catch(e => {
    console.error(e);
    process.exit(1);
});
