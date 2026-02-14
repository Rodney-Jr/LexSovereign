
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@lexsovereign.com';
    const newPassword = 'password123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: { passwordHash }
    });

    console.log(`✅ Password reset successfully for: ${user.email}`);
    console.log(`New Password: ${newPassword}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
