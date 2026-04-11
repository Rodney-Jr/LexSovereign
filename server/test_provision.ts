import { TenantService } from './src/services/TenantService';
import { prisma } from './src/db';

async function test() {
    try {
        console.log("Testing Provision...");
        const result = await TenantService.provisionTenant({
            name: "Test Tenant " + Date.now(),
            adminEmail: "admin_" + Date.now() + "@test.com",
            adminName: "Test Admin",
            plan: "STANDARD",
            region: "GH_ACC_1",
            appMode: "LAW_FIRM",
            isTrial: true
        });
        console.log("Success:", result);
    } catch (e: any) {
        console.error("Caught error outside:", e);
    }
}

test().finally(() => prisma.$disconnect());
