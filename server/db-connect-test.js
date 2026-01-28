
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:xeJdqlTncCnRKHfrAJHUDmbOXCjmpBPU@caboose.proxy.rlwy.net:27756/railway';

async function testConnection() {
    console.log(`Connecting to: ${connectionString}`);
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log("✅ Connection Successful!");
        const res = await client.query('SELECT NOW()');
        console.log(`   Time: ${res.rows[0].now}`);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    }
}

testConnection();
