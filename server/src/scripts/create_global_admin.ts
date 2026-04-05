import { PlatformService } from "../services/PlatformService";
import { prisma } from "../db";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for DB and Firebase Admin SDK
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createGlobalAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: npx ts-node src/scripts/create_global_admin.ts <email> <password> [name]");
        process.exit(1);
    }

    const [email, password, name] = args;
    const adminName = name || "Global Administrator";

    console.log(`--- Provisioning Global Admin: ${email} ---`);

    try {
        const result = await PlatformService.provisionAdmin({
            email,
            password,
            name: adminName,
            accessLevel: 'SUPER_ADMIN'
        });

        console.log("✅ Global Admin Provisioned Successfully!");
        console.log(`   Email: ${email}`);
        console.log(`   Login URL: ${result.loginUrl}`);
        console.log("\nYou can now sign in at the URL above using your email and password.");

    } catch (error: any) {
        console.error("❌ Provisioning Failed:");
        console.error("   Message:", error.message);
        console.error("   Stack:", error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

createGlobalAdmin();
