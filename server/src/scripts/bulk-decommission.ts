import { prisma } from '../db';

/**
 * Bulk Decommission Script
 * Marks all tenants (except the Demo tenant) as DELETED.
 */
async function main() {
    console.log('--- 🛡️ Sovereign Bulk Decommission Starting ---');
    
    // 1. Identify Demo Tenant (Preservation Target)
    const demoTenantName = 'NomosDesk Demo';
    const demoTenant = await prisma.tenant.findFirst({
        where: { name: demoTenantName }
    });

    if (!demoTenant) {
        console.warn('⚠️ Warning: System Demo tenant not found by name. Proceeding with caution...');
    } else {
        console.log(`✅ Identified Demo Tenant for preservation: ${demoTenant.name} (${demoTenant.id})`);
    }

    // 2. Decommission all other ACTIVE or SUSPENDED tenants
    const decommissionResult = await prisma.tenant.updateMany({
        where: {
            id: { not: demoTenant?.id || 'NO_DEMO_ID' },
            status: { not: 'DELETED' } // Don't re-delete already deleted ones
        },
        data: {
            status: 'DELETED'
        }
    });

    console.log(`🚀 [Success] Decommissioned ${decommissionResult.count} tenants.`);

    // 3. Verify
    const activeCount = await prisma.tenant.count({
        where: { status: 'ACTIVE' }
    });

    console.log(`📊 Final Platform Pulse: ${activeCount} active tenant(s) remaining.`);
    console.log('--- ✅ Decommission Complete ---');
}

main()
    .catch((e) => {
        console.error('❌ Decommission Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
