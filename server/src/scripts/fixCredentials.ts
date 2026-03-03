import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@nomosdesk.com' } });
    if (admin) {
        await prisma.user.update({
            where: { id: admin.id },
            data: {
                jurisdictionPins: ['GH_ACC_1', 'SOV-PR-1'],
                credentials: [
                    { type: 'SYSTEM_ADMIN', id: 'SA-001' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-GH-001', region: 'GH_ACC_1' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-SOV-001', region: 'SOV-PR-1' }
                ]
            }
        });
        console.log('✅ Updated admin credentials.');
    }

    const counsel = await prisma.user.findUnique({ where: { email: 'counsel@nomosdesk.com' } });
    if (counsel) {
        await prisma.user.update({
            where: { id: counsel.id },
            data: {
                jurisdictionPins: ['GH_ACC_1', 'SOV-PR-1'],
                credentials: [
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-GH-002', region: 'GH_ACC_1' },
                    { type: 'JURISDICTION_BAR_LICENSE', id: 'BAR-SOV-002', region: 'SOV-PR-1' }
                ]
            }
        });
        console.log('✅ Updated counsel credentials.');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
