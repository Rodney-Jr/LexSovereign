import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'admin_manager@nomosdesk.com';
    console.log(`Verifying data for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true,
            tenant: true
        }
    });

    if (user) {
        console.log('✅ Admin Manager Found:', user.name);
        console.log('   Role:', user.roleString);
        console.log('   Tenant:', user.tenant?.name);

        const tenantId = user.tenantId!;

        const assetCount = await prisma.firmAsset.count({ where: { tenantId } });
        console.log('✅ Asset Count:', assetCount);

        const expenseCount = await prisma.expense.count({ where: { tenantId } });
        console.log('✅ Expense Count:', expenseCount);

        const candidateCount = await prisma.candidate.count({ where: { tenantId } });
        console.log('✅ Candidate Count:', candidateCount);

        const salaryCount = await prisma.salaryRecord.count({ where: { tenantId } });
        console.log('✅ Salary Record Count:', salaryCount);

        const appraisalCount = await prisma.performanceAppraisal.count({ where: { tenantId } });
        console.log('✅ Appraisal Count:', appraisalCount);
    } else {
        console.log('❌ Admin Manager NOT found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
