import { FxRateService } from '../services/fxRateService';

async function main() {
    console.log('--- Starting Daily FX Rate Sync ---');
    await FxRateService.syncRates();
    console.log('--- Sync Completed ---');
}

main().catch(err => {
    console.error('FX Sync Script Failed:', err);
    process.exit(1);
});
