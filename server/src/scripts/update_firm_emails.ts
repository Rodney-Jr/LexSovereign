
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const updates = [
        { old: 'clerk@nomosdesk.com', new: 'clerk@nomoslaw.com' },
        { old: 'admin_manager@nomosdesk.com', new: 'admin_manager@nomoslaw.com' }
    ];

    for (const up of updates) {
        try {
            await prisma.user.update({
                where: { email: up.old },
                data: { email: up.new }
            });
            console.log(`Updated ${up.old} to ${up.new}`);
        } catch (e) {
            console.warn(`Could not update ${up.old}: user not found`);
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
