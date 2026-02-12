
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function repair() {
    console.log("🛠️ Starting Robust Migration Repair (Standard PG)...");

    // Clear BOTH potential failed migrations
    const migrationsToClear = [
        "20260212054430_add_gazette_vector",
        "20260212061500_add_gazette_standard"
    ];

    try {
        for (const failedMigrationName of migrationsToClear) {
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
            }
        }
    } catch (error: any) {
        console.error("❌ Repair failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

repair();
