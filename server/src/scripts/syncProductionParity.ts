import { prisma } from '../db';

/**
 * PRODUCTION PARITY SYNC SCRIPT
 * 
 * Goal: Bring production demo tenants into parity with local dev feature sets.
 * Specifically activates ACCOUNTING_HUB and HR_ENTERPRISE for demo accounts.
 */

async function main() {
    console.log('🚀 Starting Production Parity Sync...');

    const demoTenants = [
        {
            id: 'demo-tenant-lawfirm',
            name: 'Apex Law Partners',
            modules: ['CORE', 'ACCOUNTING_HUB', 'HR_ENTERPRISE']
        },
        {
            id: 'demo-tenant-enterprise',
            name: 'Global Logistics Corp',
            modules: ['CORE', 'HR_ENTERPRISE']
        }
    ];

    for (const target of demoTenants) {
        console.log(`Checking tenant: ${target.name} (${target.id})...`);
        
        const tenant = await prisma.tenant.findUnique({
            where: { id: target.id }
        });

        if (!tenant) {
            console.warn(`[!] Tenant ${target.id} not found in database. Skipping.`);
            continue;
        }

        // Merge modules to ensure we don't remove anything, but add missing ones
        const currentModules = tenant.enabledModules || [];
        const missingModules = target.modules.filter(m => !currentModules.includes(m));

        if (missingModules.length > 0) {
            console.log(`[+] Activating missing modules: ${missingModules.join(', ')}`);
            
            const updatedModules = Array.from(new Set([...currentModules, ...target.modules]));
            
            await prisma.tenant.update({
                where: { id: target.id },
                data: {
                    enabledModules: updatedModules,
                    plan: 'ENTERPRISE' // Ensure they are on the right plan level
                }
            });
            
            console.log(`[✓] ${target.name} updated successfully.`);
        } else {
            console.log(`[~] ${target.name} already has all required modules.`);
        }
    }

    console.log('🎉 Parity Sync Complete.');
}

main()
    .catch((e) => {
        console.error('❌ Sync Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
