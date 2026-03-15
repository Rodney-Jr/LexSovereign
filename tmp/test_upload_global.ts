async function testGlobalUpload() {
    try {
        console.log("Logging in as GLOBAL_ADMIN...");
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@nomosdesk.com',
                password: 'password123'
            })
        });

        const loginData: any = await loginRes.json();
        const token = loginData.token;
        if (!token) {
            console.error("Login failed:", loginData);
            return;
        }
        console.log("Logged in. Token acquired.");

        console.log("Attempting global template upload...");
        const uploadRes = await fetch('http://localhost:3001/api/document-templates', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Global Test Template ' + Date.now(),
                description: 'test global',
                category: 'GENERAL',
                jurisdiction: 'GH_ACC_1',
                content: '# Global Content',
                version: '1.0.0'
            })
        });

        const uploadData: any = await uploadRes.json();
        if (uploadRes.ok) {
            console.log("Global Upload Success:", uploadData.id);
        } else {
            console.error("Global Upload Failed Status:", uploadRes.status);
            console.error("Global Upload Failed Data:", uploadData);
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

testGlobalUpload();
