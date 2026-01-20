
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:xeJdqlTncCnRKHfrAJHUDmbOXCjmpBPU@caboose.proxy.rlwy.net:27756/railway';

async function testConfig(name, config) {
    console.log(`\n--- Testing ${name} ---`);
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000,
        ...config
    });

    try {
        await client.connect();
        console.log(`✅ ${name}: Connected!`);
        const res = await client.query('SELECT version()');
        console.log(`   Version: ${res.rows[0].version}`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ ${name}: Failed - ${err.message}`);
        try { await client.end(); } catch (e) { }
        return false;
    }
}

async function run() {
    // Test 1: SSL Required (Standard for Public Cloud)
    await testConfig('SSL Required', { ssl: { rejectUnauthorized: false } });

    // Test 2: No SSL (Unlikely for public, but good to check)
    await testConfig('No SSL', { ssl: false });

    // Test 3: SSL Allow Invalid
    await testConfig('SSL (Accept Invalid)', { ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined } });
}

run();
