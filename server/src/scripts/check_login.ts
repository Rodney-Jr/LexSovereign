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

    console.log(`User ${email} found.`);
    process.exit(0);
}

checkLogin();
