import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nomosdesk.com';
    const passwordHash = await bcrypt.hash('password123', 10);

    const user = await prisma.user.update({
        where: { email },
        data: { passwordHash }
    });

    console.log(`✅ Password reset successfully for: ${user.email}`);
    console.log(`New Native Password: password123`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
