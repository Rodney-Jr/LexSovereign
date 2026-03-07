import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const emails = [
        'managing_partner@nomosdesk.com',
        'tech_admin@nomosdesk.com',
        'associate1@nomosdesk.com',
        'admin_manager@nomosdesk.com'
    ];

    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (user) {
            console.log(`✅ FOUND: ${email} (Role: ${user.role?.name})`);
        } else {
            console.log(`❌ NOT FOUND: ${email}`);
        }
    }
}

main().finally(() => prisma.$disconnect());
