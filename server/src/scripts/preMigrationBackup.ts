import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Pre-Migration Backup Script
 * ---------------------------
 * This script runs right before 'npx prisma migrate deploy' to create
 * a safety dump of the database.
 */
async function runBackup() {
    console.log('[Sovereign Guard] Starting pre-migration backup...');
    
    // 1. Get connection string from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.warn('❌ DATABASE_URL missing. Skipping safety backup.');
        return;
    }

    // 2. Prepare backup path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    const backupFile = path.join(backupDir, `pre-migration-${timestamp}.sql`);

    try {
        // 3. Attempt to use pg_dump if available (Standard on Railway/Docker)
        console.log(`[Backup] Exporting to ${backupFile}...`);
        
        // Use connection string directly with pg_dump
        // Note: pg_dump usually handles the password via the URL or PGPASSWORD
        execSync(`pg_dump "${dbUrl}" --no-owner --no-privileges > "${backupFile}"`, { stdio: 'inherit' });
        
        const stats = fs.statSync(backupFile);
        console.log(`✅ [Backup] Success! File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Cleanup old local backups (keep last 5)
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('pre-migration-'))
            .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 5) {
            files.slice(5).forEach(f => {
                fs.unlinkSync(path.join(backupDir, f.name));
                console.log(`[Cleanup] Deleted old local backup: ${f.name}`);
            });
        }

    } catch (error: any) {
        // Non-blocking error: we don't want to stop the deployment if backup fails,
        // (the user has Railway's daily backups as secondary safety), 
        // but we should log it clearly.
        console.error('⚠️ [Backup] Failed to create local safety dump:', error.message);
        console.warn('[Backup] Proceeding with deployment (Railway daily backups are your secondary safety).');
    }
}

runBackup();
