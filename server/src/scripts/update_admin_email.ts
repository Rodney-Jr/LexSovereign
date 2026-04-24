
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.update({
        where: { email: 'law-admin@nomosdesk.com' },
        data: { email: 'law-admin@nomoslaw.com' }
    });
    console.log('Successfully updated user email:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
