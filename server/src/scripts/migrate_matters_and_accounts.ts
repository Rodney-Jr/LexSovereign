/**
 * Comprehensive Migration Script
 * 1. Backfills Client records from ActivityEntry INCEPTION log metadata
 * 2. Associates matters with newly created clients
 * 3. Creates default FirmAccounts for tenants that don't have one
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== Starting Comprehensive Migration ===\n');

    // --- PART 1: Backfill Client records from ActivityEntry ---
    console.log('--- Part 1: Backfilling Client records from ActivityEntry ---');

    const orphanMatters = await prisma.matter.findMany({
        where: { clientId: null }
    });

    console.log(`Found ${orphanMatters.length} matters with no clientId.`);

    for (const matter of orphanMatters) {
        // Look up INCEPTION activity entry with client metadata
        const inception = await prisma.activityEntry.findFirst({
            where: {
                matterId: matter.id,
                type: 'INCEPTION'
            }
        });

        const metadata = inception?.metadata as any;
        const clientName: string | undefined = metadata?.client;

        if (!clientName) {
            console.warn(`  [SKIP] Matter "${matter.name}" (${matter.id}) has no ActivityEntry with client name. Will link to placeholder.`);
            continue;
        }

        console.log(`  [LINK] Matter "${matter.name}" → Client "${clientName}"`);

        // Find or create the Client record
        let client = await prisma.client.findFirst({
            where: { name: clientName, tenantId: matter.tenantId }
        });

        if (!client) {
            client = await prisma.client.create({
                data: { name: clientName, tenantId: matter.tenantId }
            });
            console.log(`    ✅ Created Client: ${clientName} (${client.id})`);
        } else {
            console.log(`    ✅ Reusing existing Client: ${clientName} (${client.id})`);
        }

        await prisma.matter.update({
            where: { id: matter.id },
            data: { clientId: client.id }
        });
    }

    // --- Now handle any remaining matters STILL with null clientId (no ActivityEntry) ---
    const stillOrphan = await prisma.matter.findMany({ where: { clientId: null } });
    if (stillOrphan.length > 0) {
        console.log(`\n  [FALLBACK] ${stillOrphan.length} matters still have no clientId. Linking to a placeholder "Unknown Client".`);
        for (const matter of stillOrphan) {
            let placeholder = await prisma.client.findFirst({
                where: { name: 'Unknown Client', tenantId: matter.tenantId }
            });
            if (!placeholder) {
                placeholder = await prisma.client.create({
                    data: { name: 'Unknown Client', tenantId: matter.tenantId }
                });
            }
            await prisma.matter.update({
                where: { id: matter.id },
                data: { clientId: placeholder.id }
            });
            console.log(`    ✅ Linked Matter "${matter.name}" to "Unknown Client"`);
        }
    }

    // --- PART 2: Create default FirmAccounts for all tenants ---
    console.log('\n--- Part 2: Initializing FirmAccounts ---');
    const tenants = await prisma.tenant.findMany();
    for (const tenant of tenants) {
        const count = await prisma.firmAccount.count({ where: { tenantId: tenant.id } });
        if (count === 0) {
            await prisma.firmAccount.create({
                data: {
                    name: 'General Operating Account',
                    type: 'OPERATING',
                    currency: 'USD',
                    balance: 0,
                    tenantId: tenant.id
                }
            });
            console.log(`  ✅ Created FirmAccount for Tenant: ${tenant.name} (${tenant.id})`);
        } else {
            console.log(`  [OK] Tenant "${tenant.name}" already has ${count} account(s).`);
        }
    }

    // --- SUMMARY ---
    const clientCount = await prisma.client.count();
    const linkedMatters = await prisma.matter.count({ where: { clientId: { not: null } } });
    const totalMatters = await prisma.matter.count();
    const firmAccountCount = await prisma.firmAccount.count();

    console.log('\n=== Migration Summary ===');
    console.log(`  Clients created: ${clientCount}`);
    console.log(`  Matters linked:  ${linkedMatters} / ${totalMatters}`);
    console.log(`  FirmAccounts:    ${firmAccountCount}`);
    console.log('=========================\n');
}

main()
    .catch(e => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
