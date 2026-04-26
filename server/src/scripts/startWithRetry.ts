import { execSync, spawnSync } from 'child_process';

/**
 * startWithRetry.ts
 * -----------------
 * Wraps the full database initialisation sequence (backup → repair → migrate
 * → seed) in a retry loop with exponential backoff before handing off to the
 * main application process.
 *
 * Retry schedule (up to MAX_RETRIES attempts):
 *   Attempt 1 → wait 1 s → Attempt 2 → wait 2 s → … → wait 16 s → Attempt 5
 *
 * Exit codes:
 *   0  – application exited normally
 *   1  – all retries exhausted without a successful DB initialisation
 */

const MAX_RETRIES = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(): string {
    return new Date().toISOString();
}

function log(msg: string): void {
    console.log(`[${ts()}] ${msg}`);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run a shell command synchronously, streaming its output to the parent
 * process.  Returns true on success, false on failure.
 */
function run(cmd: string, label: string): boolean {
    log(`▶  ${label}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
        log(`✅ ${label} — done`);
        return true;
    } catch (err: any) {
        log(`❌ ${label} — failed: ${err.message ?? String(err)}`);
        return false;
    }
}

// ---------------------------------------------------------------------------
// Database initialisation sequence
// ---------------------------------------------------------------------------

async function initDatabase(): Promise<void> {
    // 1. Guard: DATABASE_URL must be present before we touch anything
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set — cannot initialise the database.');
    }

    // 2. Pre-migration backup (non-fatal — we log and continue on failure)
    run(
        'node dist/scripts/preMigrationBackup.js || ts-node src/scripts/preMigrationBackup.ts',
        'Pre-migration backup',
    );

    // 3. Migration repair (non-fatal)
    run(
        'node dist/scripts/repairMigration.js || ts-node src/scripts/repairMigration.ts',
        'Migration repair',
    );

    // 4. Prisma migrate deploy — FATAL if this fails (triggers a retry)
    const migrateOk = run('npx prisma migrate deploy', 'prisma migrate deploy');
    if (!migrateOk) {
        throw new Error('prisma migrate deploy failed.');
    }

    // 5. Prisma db push — FATAL if this fails (triggers a retry)
    const pushOk = run('npx prisma db push --accept-data-loss', 'prisma db push');
    if (!pushOk) {
        throw new Error('prisma db push failed.');
    }

    // 6. Stripe ID repair (non-fatal)
    run(
        'node dist/scripts/repairStripeIds.js',
        'Stripe ID repair',
    );

    // 7. Template seed (non-fatal)
    run(
        'node dist/scripts/seedTemplates.js || ts-node src/scripts/seedTemplates.ts',
        'Template seed',
    );

    // 8. System permission seed (non-fatal)
    run(
        'node dist/scripts/seed.js',
        'System permission seed',
    );
}

// ---------------------------------------------------------------------------
// Retry loop
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    log('🚀 NomosDesk startup sequence initiated.');

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        log(`🔄 Database initialisation — attempt ${attempt} of ${MAX_RETRIES}`);

        try {
            await initDatabase();
            log('✅ Database initialisation complete. Starting application…');
            break; // Success — exit the retry loop
        } catch (err: any) {
            const message = err.message ?? String(err);
            log(`⚠️  Attempt ${attempt} failed: ${message}`);

            if (attempt === MAX_RETRIES) {
                log('💥 All retry attempts exhausted. Exiting with error.');
                process.exit(1);
            }

            const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, 8s, 16s
            log(`⏳ Waiting ${backoffMs / 1000}s before next attempt…`);
            await sleep(backoffMs);
        }
    }

    // ---------------------------------------------------------------------------
    // Hand off to the application — replace the current process so signals
    // (SIGTERM, SIGINT) are forwarded correctly by the container runtime.
    // ---------------------------------------------------------------------------
    log('🟢 Launching node dist/index.js');
    const result = spawnSync('node', ['dist/index.js'], { stdio: 'inherit' });
    process.exit(result.status ?? 0);
}

main();
