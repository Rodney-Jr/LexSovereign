import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkLogin() {
    const email = 'clerk@nomosdesk.com';
    const password = 'password123';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found');
        process.exit(1);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log(`Login check for ${email}: ${isMatch ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(isMatch ? 0 : 1);
}

checkLogin();
