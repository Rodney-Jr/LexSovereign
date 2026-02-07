
const BASE_URL = 'http://localhost:3001';

async function verify() {
    console.log('🔍 Verifying Implementation...');

    // 1. Login
    console.log('👉 Attempting Login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@lexsovereign.com',
            password: 'password123'
        })
    });

    if (!loginRes.ok) {
        console.error('❌ Login Failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login Successful. Token acquired.');

    // 2. Platform Stats
    console.log('👉 Fetching Platform Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/platform/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!statsRes.ok) {
        console.error('❌ Platform Stats Failed:', await statsRes.text());
        process.exit(1);
    }

    const stats = await statsRes.json();
    console.log('✅ Platform Stats:', stats);

    if (stats.tenants === undefined || stats.silos === undefined) {
        console.error('❌ Invalid Stats Format');
        process.exit(1);
    }

    // 3. User List
    console.log('👉 Fetching User List...');
    const usersRes = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!usersRes.ok) {
        console.error('❌ User Fetch Failed:', await usersRes.text());
        process.exit(1);
    }

    const users = await usersRes.json();
    console.log(`✅ Users Fetched: ${users.length} users found.`);
    if (users.length === 0) {
        console.warn('⚠️ Warning: No users found (unexpected for seeded DB)');
    } else {
        console.log('Sample User:', users[0].email);
    }

    console.log('🎉 Verification Complete: All Systems Nominal.');
}

verify().catch(console.error);
