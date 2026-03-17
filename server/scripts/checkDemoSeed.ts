import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeedData() {
    const requiredData = [
        { tenant: 'Apex Law Partners', email: 'admin@apexlaw.demo', role: 'Tenant Admin' },
        { tenant: 'Apex Law Partners', email: 'client@apexlaw.demo', role: 'Client' },
        { tenant: 'Global Logistics Corp', email: 'admin@globallogistics.demo', role: 'Tenant Admin' }
    ];

    console.log('--- Seed Data Check ---');

    for (const item of requiredData) {
        const user = await prisma.user.findFirst({
            where: {
                email: item.email,
                tenant: {
                    name: item.tenant
                }
            },
            include: {
                tenant: true
            }
        });

        if (user) {
            console.log(`✅ FOUND: ${item.email} in ${item.tenant} (Role: ${user.role})`);
        } else {
            // Check if tenant exists at least
            const tenant = await prisma.tenant.findFirst({ where: { name: item.tenant } });
            if (tenant) {
                console.log(`❌ NOT FOUND: ${item.email} (but Tenant ${item.tenant} exists)`);
            } else {
                console.log(`❌ NOT FOUND: Tenant ${item.tenant} does not exist.`);
            }
        }
    }
}

checkSeedData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
