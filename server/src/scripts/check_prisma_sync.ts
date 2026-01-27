import { PrismaClient } from '@prisma/client';
import fs from 'fs';

async function checkPrisma() {
    const prisma = new PrismaClient();
    const results: any = {};

    // Check Tenant fields
    try {
        const tenant = await (prisma as any).tenant.findFirst();
        if (tenant) {
            results.tenantKeys = Object.keys(tenant);
        } else {
            results.tenantError = "No tenants found";
        }
    } catch (e: any) {
        results.tenantError = e.message;
    }

    results.invitationDelegate = !!(prisma as any).invitation;
    results.invitationsDelegate = !!(prisma as any).invitations;

    fs.writeFileSync('prisma_diagnostic.json', JSON.stringify(results, null, 2));
    await prisma.$disconnect();
}

checkPrisma();
