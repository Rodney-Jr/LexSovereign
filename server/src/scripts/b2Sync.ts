import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Sovereign B2 Sync Engine
 * -----------------------
 * Performs a deep-sync of the legal registry and a cold-dump of the database 
 * to your encrypted Backblaze B2 vault.
 */
async function runSovereignSync() {
    console.log('🚀 [Sovereign Sync] Initializing off-site sync to Backblaze B2...');

    // 1. Environment Config (Pull from Railway Variables)
    // Note: To use rclone without a config file, we can use env variables:
    // RCLONE_CONFIG_B2_TYPE=b2
    // RCLONE_CONFIG_B2_ACCOUNT=Your_Account_ID
    // RCLONE_CONFIG_B2_KEY=Your_Application_Key
    
    const B2_BUCKET = process.env.B2_BUCKET_NAME || 'nomosdesk-vault';
    const DB_URL = process.env.DATABASE_URL;
    const STORAGE_PATH = process.env.STORAGE_PATH || './storage'; // Your local doc registry

    if (!DB_URL) {
        console.error('❌ DATABASE_URL missing. Sync aborted.');
        process.exit(1);
    }

    // Ensure storage path exists locally before syncing
    if (!fs.existsSync(STORAGE_PATH)) {
        console.warn(`⚠️ STORAGE_PATH (${STORAGE_PATH}) does not exist. Creating it...`);
        fs.mkdirSync(STORAGE_PATH, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const localBackupFile = path.join('/tmp', `cold-dump-${timestamp}.sql`);

    try {
        // --- STEP 1: Database Cold Dump ---
        console.log(`[Database] Dumping to ${localBackupFile}...`);
        // Using quotes around DB_URL to handle special characters
        execSync(`pg_dump "${DB_URL}" --no-owner --no-privileges > "${localBackupFile}"`, { stdio: 'inherit' });

        // --- STEP 2: Sync Database Dump to B2 ---
        console.log(`[B2] Sending database dump to off-site vault...`);
        // b2: is the remote name we assume is configured in rclone
        // Alternatively, if using env-based config, we use the name 'b2'
        execSync(`rclone copy "${localBackupFile}" b2:${B2_BUCKET}/db-backups/ --progress`, { stdio: 'inherit' });

        // --- STEP 3: Active File Sync (The Registry) ---
        console.log(`[B2] Mirroring file registry to ${B2_BUCKET}/storage/ ...`);
        // 'sync' makes the B2 bucket an exact mirror of your current storage
        execSync(`rclone sync "${STORAGE_PATH}" b2:${B2_BUCKET}/storage/ --progress`, { stdio: 'inherit' });

        // --- Cleanup ---
        if (fs.existsSync(localBackupFile)) {
            fs.unlinkSync(localBackupFile);
            console.log(`[Cleanup] Removed temporary local dump: ${localBackupFile}`);
        }
        
        console.log('✅ [Sovereign Sync] COMPLETE. Your legal enclave is mirrored off-site.');

    } catch (error: any) {
        console.error('❌ [Sovereign Sync] FAILED:', error.message);
        // We log the error but don't necessarily want to crash the whole app 
        // if this is running as a side-car or cron.
        process.exit(1);
    }
}

runSovereignSync();
