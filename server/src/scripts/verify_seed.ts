
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Financial Seeding Verification ---');
    
    const tenants = await prisma.tenant.findMany({
        where: { name: { in: ['Nomos Law', 'AstraCorp Legal'] } },
        include: {
            _count: {
                select: {
                    accounts: true,
                    ledgerTransactions: true,
                    expenses: true,
                    matters: true,
                }
            }
        }
    });

    for (const t of tenants) {
        console.log(`Tenant: ${t.name}`);
        console.log(`- Accounts: ${t._count.accounts}`);
        console.log(`- Ledger Transactions: ${t._count.ledgerTransactions}`);
        console.log(`- Expenses: ${t._count.expenses}`);
        console.log(`- Matters: ${t._count.matters}`);
        
        const invoices = await prisma.invoice.count({ where: { tenantId: t.id } });
        console.log(`- Invoices: ${invoices}`);

        const timeEntries = await prisma.timeEntry.count({ where: { tenantId: t.id } });
        console.log(`- Time Entries: ${timeEntries}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
