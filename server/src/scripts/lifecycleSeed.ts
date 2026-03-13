import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function main() {
    console.log('🌱 Seeding Localized Lifecycle Demo Data...');

    const tenantId = randomUUID();
    const adminId = randomUUID();
    const region = 'GH_ACC_1';

    try {
        // 1. Check or Create Tenant
        let tenant = await prisma.tenant.findFirst({ where: { name: 'Nomos Law Practice' } });
        if (!tenant) {
            tenant = await prisma.tenant.create({
                data: {
                    id: tenantId,
                    name: 'Nomos Law Practice',
                    plan: 'ENTERPRISE',
                    primaryRegion: region,
                    appMode: 'LAW_FIRM'
                }
            });
        }
        
        // 2. Check or Create Role
        let partnerRole = await prisma.role.findFirst({
            where: { name: 'MANAGING_PARTNER', tenantId: tenant.id }
        });
        
        if (!partnerRole) {
            partnerRole = await prisma.role.create({
                data: {
                    name: 'MANAGING_PARTNER',
                    tenantId: tenant.id,
                    isSystem: true,
                    permissions: { connect: [{ id: 'manage_tenant' }, { id: 'create_matter' }, { id: 'ai_chat_execute' }] }
                }
            });
        }

        // 3. User Upsert
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.upsert({
            where: { email: 'kofi.adu@nomoslaw.com' },
            create: {
                id: adminId,
                email: 'kofi.adu@nomoslaw.com',
                name: 'Kofi Adu',
                passwordHash,
                tenantId: tenant.id,
                roleId: partnerRole.id,
                roleString: 'MANAGING_PARTNER',
                region
            },
            update: {
                passwordHash
            }
        });

        // 4. Create Pricing Config for Ghana Localization
        await prisma.pricingConfig.upsert({
            where: { id: 'ENTERPRISE' },
            create: {
                id: 'ENTERPRISE',
                basePrice: 1500, // GHS
                pricePerUser: 150,
                creditsIncluded: 50000,
                features: { localization: 'GH', compliance: ['ACT_843'] },
                maxUsers: 50
            },
            update: {}
        });

        console.log('✅ Demo data seeded successfully.');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
}

main().finally(() => prisma.$disconnect());
