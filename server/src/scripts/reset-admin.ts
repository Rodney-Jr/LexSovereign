import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nomosdesk.com';
    const firebaseUid = 'fb-admin-demo';

    const user = await prisma.user.update({
        where: { email },
        // @ts-ignore
        data: { firebaseUid }
    });

    console.log(`✅ Identity reset successfully for: ${user.email}`);
    console.log(`New Firebase UID: ${firebaseUid}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
