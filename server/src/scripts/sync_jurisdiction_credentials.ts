import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Syncing Jurisdiction Credentials for legal roles...');

    // Define roles that require bar licenses
    const legalRoles = [
        'TENANT_ADMIN',
        'PARTNER',
        'SENIOR_COUNSEL',
        'INTERNAL_COUNSEL',
        'JUNIOR_ASSOCIATE',
        'DEPUTY_GC'
    ];

    const users = await prisma.user.findMany({
        where: {
            roleString: { in: legalRoles }
        }
    });

    console.log(`Found ${users.length} users with legal roles.`);

    for (const user of users) {
        const currentPins = (user.jurisdictionPins as string[]) || [];
        const currentCredentials = (user.credentials as any[]) || [];

        const updatedPins = Array.from(new Set([...currentPins, 'GH_ACC_1', 'SOV-PR-1']));

        // Add bar licenses if missing
        const hasGhLicense = currentCredentials.some((c: any) => c.type === 'JURISDICTION_BAR_LICENSE' && c.region === 'GH_ACC_1');
        const hasSovLicense = currentCredentials.some((c: any) => c.type === 'JURISDICTION_BAR_LICENSE' && c.region === 'SOV-PR-1');

        const newCredentials = [...currentCredentials];

        if (!hasGhLicense) {
            newCredentials.push({
                type: 'JURISDICTION_BAR_LICENSE',
                id: `BAR-GH-${user.id.slice(0, 4)}`,
                region: 'GH_ACC_1'
            });
        }

        if (!hasSovLicense) {
            newCredentials.push({
                type: 'JURISDICTION_BAR_LICENSE',
                id: `BAR-SOV-${user.id.slice(0, 4)}`,
                region: 'SOV-PR-1'
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                jurisdictionPins: updatedPins,
                credentials: newCredentials
            }
        });

        console.log(`✅ Updated credentials for: ${user.email}`);
    }

    console.log('✨ Jurisdiction credentials sync complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
