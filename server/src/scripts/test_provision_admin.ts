
import { PlatformService } from "../services/PlatformService";
import { prisma } from "../db";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyProvisioning() {
    console.log("--- Starting Platform Admin Provisioning Verification ---");

    const testAdmin = {
        name: "Fleet Test Admin",
        email: `test-fleet-${Date.now()}@nomosdesk.com`,
        accessLevel: "INFRA_ADMIN" as const
    };

    try {
        console.log(`Provisioning admin: ${testAdmin.email}`);
        const result = await PlatformService.provisionAdmin(testAdmin);

        console.log("✅ Provisioning Result Received:");
        console.log(`   Admin ID: ${result.adminId}`);
        console.log(`   Login URL: ${result.loginUrl}`);

        // Verify in Database
        const dbUser = await prisma.user.findUnique({
            where: { id: result.adminId }
        });

        if (dbUser && (dbUser.attributes as any)?.platformAccessLevel === "INFRA_ADMIN") {
            console.log("✅ Database Verification: SUCCESS");
            console.log(`   Internal Role: ${dbUser.roleString}`);
            console.log(`   Password Secured: ${!!dbUser.passwordHash ? '✅' : '❌'}`);
            console.log(`   Access Level: ${(dbUser.attributes as any).platformAccessLevel}`);
        } else {
            console.error("❌ Database Verification: FAILED");
            console.log("   User Data:", dbUser);
        }

    } catch (error: any) {
        console.error("❌ Provisioning Failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyProvisioning();
