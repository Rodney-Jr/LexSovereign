
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function repair() {
    console.log("🛠️ Starting Aggressive Migration Repair (pg-native)...");

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Database connected via pg-native.");

        // 1. Terminate other sessions holding locks on the migration table
        // This is crucial for Railway where migrations might hang and lock the table
        console.log("🧙 Terminating blocking database sessions...");
        await client.query(`
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE pid <> pg_backend_pid()
              AND query LIKE '%_prisma_migrations%'
              AND wait_event_type = 'Lock';
        `);

        // 2. Clear ANY failed migrations (missing finished_at)
        console.log("🧹 Identifying and clearing stale migration states...");
        const result = await client.query(`
            DELETE FROM "_prisma_migrations" 
            WHERE finished_at IS NULL;
        `);

        console.log(`✅ Cleared ${result.rowCount} failed migration records.`);

    } catch (error: any) {
        console.error("❌ Aggressive repair failed:", error.message);
    } finally {
        await client.end();
        console.log("🏁 Repair sequence complete.");
    }
}

repair();
