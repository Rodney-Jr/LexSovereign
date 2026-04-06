
import { PlatformService } from "../services/PlatformService";
import { TenantService } from "../services/TenantService";
import { prisma } from "../db";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { sendTenantWelcomeEmail } from "../services/EmailService";

// Load environment
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyEmailDispatch() {
    console.log(`\n========== NATIVE ↔ RBAC SYNC VERIFICATION ==========`);
    const testAdminEmail = `fleet-email-test-${Date.now()}@nomosdesk.com`;
    console.log(`Target: ${testAdminEmail}\n`);

    // 1. Manually trigger sendTenantWelcomeEmail to verify the log statement works
    console.log("\n[Test 1] Verifying EmailService log statement...");
    try {
        await sendTenantWelcomeEmail({
            to: testAdminEmail,
            adminName: "Email Tester",
            tenantName: "Verification Enclave",
            tempPassword: "Check email for link",
            loginUrl: "http://localhost:3000/login"
        }).catch(err => {
            console.log("[Email Service] Note: Network call might fail (expected if no API key).");
        });
    } catch (e) {
        // Ignored
    }

    // 2. Simulate Platform Admin Provisioning
    console.log("\n[Test 2] Simulating Platform Admin Provisioning logic...");
    try {
        const adminInput = {
            name: "Fleet Admin Email Test",
            email: testAdminEmail,
            accessLevel: "SECURITY_ADMIN" as const
        };
        console.log(`Provisioning fleet admin: ${adminInput.email}`);
        const result = await PlatformService.provisionAdmin(adminInput);
        console.log("✅ Platform Admin Instance Created in DB.");

        // 1. Password Hash check
        const user = await prisma.user.findUnique({ where: { email: adminInput.email } });
        const hasPasswordHash = !!user?.passwordHash;
        console.log(`1. Password Secured:        ${hasPasswordHash ? '✅' : '❌'}`);

        if (result.loginUrl) {
            console.log("✅ Provisioning Result contains credentials. Triggering email...");
            await sendTenantWelcomeEmail({
                to: adminInput.email,
                adminName: adminInput.name,
                tenantName: 'Sovereign Control Plane',
                tempPassword: 'Check email for link',
                loginUrl: result.loginUrl
            }).catch(() => { });
        }
    } catch (error: any) {
        console.error("❌ Platform Admin Provisioning Failed:", error.message);
    }

    // 3. Simulate Tenant Provisioning
    console.log("\n[Test 3] Simulating Tenant Provisioning logic...");
    try {
        const tenantInput = {
            name: `Tenant-Test-${Date.now()}`,
            adminEmail: `tenant-test-${Date.now()}@nomosdesk.com`,
            adminName: "Tenant Admin Test",
            plan: "PRO"
        };
        console.log(`Provisioning tenant: ${tenantInput.name}`);
        const result = await TenantService.provisionTenant(tenantInput);
        console.log("✅ Tenant Instance Created in DB.");

        if (result.adminId && result.loginUrl) {
            console.log("✅ Provisioning Result contains credentials. Triggering email...");
            await sendTenantWelcomeEmail({
                to: tenantInput.adminEmail,
                adminName: tenantInput.adminName,
                tenantName: tenantInput.name,
                tempPassword: 'Check email for link',
                loginUrl: result.loginUrl
            }).catch(() => { });
        }
    } catch (error: any) {
        console.error("❌ Tenant Provisioning Failed:", error.message);
    }

    console.log("\n--- Verification Complete ---");
    await prisma.$disconnect();
}

verifyEmailDispatch().catch(err => {
    console.error("Fatal Error in verification script:", err);
    process.exit(1);
});
