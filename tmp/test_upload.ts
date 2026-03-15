async function testUpload() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'partner@enterpriselegal.com',
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

        console.log("Attempting template upload...");
        const uploadRes = await fetch('http://localhost:3001/api/document-templates', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Template partner' + Date.now(),
                description: 'test descript',
                category: 'GENERAL',
                jurisdiction: 'GH_ACC_1',
                content: '# Test Content',
                version: '1.0.0'
            })
        });

        const uploadData: any = await uploadRes.json();
        if (uploadRes.ok) {
            console.log("Upload Success:", uploadData.id);
        } else {
            console.error("Upload Failed Status:", uploadRes.status);
            console.error("Upload Failed Data:", uploadData);
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

testUpload();
