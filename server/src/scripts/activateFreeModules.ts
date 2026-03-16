import { prisma } from '../db';

/**
 * ACTIVATE FREE MODULES SCRIPT (PRODUCTION)
 * 
 * Goal: Ensure ALL tenants have 'ACCOUNTING_HUB' and 'HR_ENTERPRISE' 
 * in their enabledModules array.
 */

async function main() {
    console.log('🚀 Starting Global Free Module Activation...');

    const tenants = await prisma.tenant.findMany();
    console.log(`Found ${tenants.length} tenants to process.`);

    const freeModules = ['ACCOUNTING_HUB', 'HR_ENTERPRISE'];

    for (const tenant of tenants) {
        const currentModules = tenant.enabledModules || [];
        const missingModules = freeModules.filter(m => !currentModules.includes(m));

        if (missingModules.length > 0) {
            console.log(`[+] Updating tenant: ${tenant.name} (${tenant.id})`);
            console.log(`    Missing modules: ${missingModules.join(', ')}`);

            const updatedModules = Array.from(new Set([...currentModules, ...freeModules]));

            await prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                    enabledModules: updatedModules
                }
            });

            console.log(`    [✓] Updated successfully.`);
        } else {
            console.log(`[~] Tenant ${tenant.name} already has all free modules active.`);
        }
    }

    console.log('🎉 Global Activation Complete.');
}

main()
    .catch((e) => {
        console.error('❌ Activation Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
