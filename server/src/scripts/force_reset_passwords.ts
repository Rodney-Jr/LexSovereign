import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function forceSync() {
    const passwordHash = await bcrypt.hash('password123', 10);
    const DEMO_EMAILS = ['clerk@nomosdesk.com', 'admin_manager@nomosdesk.com', 'counsel@nomosdesk.com'];

    for (const email of DEMO_EMAILS) {
        const result = await prisma.user.updateMany({
            where: { email },
            data: { passwordHash }
        });
        console.log(`Synced password for ${email}: ${result.count} row(s) updated`);
    }

    // Verify
    const users = await prisma.user.findMany({
        where: { email: { in: DEMO_EMAILS } }
    });

    for (const user of users) {
        const exists = !!user.passwordHash;
        console.log(`Verify ${user.email}: ${exists ? '✅ SECURED' : '❌ MISSING'}`);
    }

    process.exit(0);
}

forceSync().catch(e => {
    console.error(e);
    process.exit(1);
});
