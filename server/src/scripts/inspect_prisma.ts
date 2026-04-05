import { prisma } from "../db";

async function inspectPrisma() {
    console.log("Inspecting Prisma User Model...");
    try {
        // @ts-ignore - checking runtime fields
        const userFields = Object.keys(prisma.user);
        console.log("User Model Keys:", userFields);
        
        // Try a findFirst to see actual DB columns
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
            console.log("First User Keys:", Object.keys(firstUser));
        } else {
            console.log("No users in DB yet.");
        }
    } catch (error: any) {
        console.error("❌ Prisma Inspection Failed:", error.message);
    }
    process.exit(0);
}

inspectPrisma();
