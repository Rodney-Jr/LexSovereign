import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function testPem() {
    const pemPath = path.resolve(__dirname, '../../sanitized_pk.tmp');
    if (!fs.existsSync(pemPath)) {
        console.error("PEM file not found!");
        return;
    }

    const pem = fs.readFileSync(pemPath, 'utf8');
    console.log("Testing PEM parsing...");
    
    try {
        const key = crypto.createPrivateKey(pem);
        console.log("✅ SUCCESS: PEM parsed correctly by crypto module.");
        console.log("Key type:", key.type);
    } catch (error: any) {
        console.error("❌ FAILURE: PEM parsing failed.");
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
    }
}

testPem();
