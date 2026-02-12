
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function repair() {
    console.log("🛠️ Starting Robust Migration Repair...");

    const failedMigrationName = "20260212054430_add_gazette_vector";

    // 1. Try to enable pgvector extension
    try {
        console.log("🐘 Attempting to enable pgvector extension...");
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log("✅ pgvector extension handled.");
    } catch (error: any) {
        console.warn("⚠️ Extension creation failed (Expected on standard Railway PG):", error.message);
    }

    // 2. Clear failed migration from _prisma_migrations
    try {
        console.log(`🧹 Checking for failed migration: ${failedMigrationName}...`);
        const migration: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM "_prisma_migrations" WHERE migration_name = $1`,
            failedMigrationName
        );

        if (migration.length > 0 && !migration[0].finished_at) {
            console.log(`⚠️ Found failed migration record. Deleting to allow retry...`);
            await prisma.$executeRawUnsafe(
                `DELETE FROM "_prisma_migrations" WHERE migration_name = $1`,
                failedMigrationName
            );
            console.log("✅ Failed migration state cleared.");
        } else {
            console.log("ℹ️ No failed migration record found for this version.");
        }
    } catch (error: any) {
        console.error("❌ Failed to clear migration record:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

repair();
