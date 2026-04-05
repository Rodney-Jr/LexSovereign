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

    // @ts-ignore
    const exists = !!user.firebaseUid;
    console.log(`User ${email} has firebaseUid: ${exists ? 'YES' : 'NO'}`);
    process.exit(exists ? 0 : 1);
}

checkLogin();
