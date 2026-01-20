
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:xeJdqlTncCnRKHfrAJHUDmbOXCjmpBPU@caboose.proxy.rlwy.net:27756/railway',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
});

async function test() {
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection error:", err);
    }
}

test();
