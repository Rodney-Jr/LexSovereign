
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { LocalStorageAdapter } from '../infrastructure/adapters/LocalStorageAdapter';

const prisma = new PrismaClient();
const storage = new LocalStorageAdapter();

async function verifyEncryption() {
    console.log("🔐 Starting Encryption Verification...");

    // 1. Create a test tenant with BYOK enabled (simulated)
    // For this test, we'll just check if the logic in LocalStorageAdapter handles encryption
    // We need to verify if the file saved to disk is different from the input

    const content = "This is a SECRET sovereign document that should be encrypted.";
    const buffer = Buffer.from(content, 'utf-8');
    const filename = `test_encrypt_${Date.now()}.txt`;
    const key = "12345678901234567890123456789012"; // 32 bytes

    console.log(`📄 Original Content: "${content}"`);

    // 2. Upload with Encryption
    console.log("🚀 Uploading with Encryption...");
    const storagePath = await storage.upload(buffer, filename, {
        encrypted: true,
        key: key
    });

    console.log(`💾 Saved to: ${storagePath}`);

    // 3. Inspect File on Disk
    const fullPath = path.resolve(process.cwd(), storagePath);
    const savedBuffer = fs.readFileSync(fullPath);
    const savedContent = savedBuffer.toString('utf-8');

    console.log(`Search for original text in file...`);
    if (savedContent.includes("SECRET sovereign document")) {
        console.error("❌ FAILURE: Original text found in saved file! Encryption failed.");
    } else {
        console.log("✅ SUCCESS: Original text NOT found in saved file.");
        console.log(`🔒 Encrypted Content Start: ${savedContent.substring(0, 50)}...`);
    }

    // 4. Decrypt and Verify
    console.log("🔓 Decrypting...");
    const decryptedBuffer = await storage.download(storagePath, {
        encrypted: true,
        key: key
    });
    const decryptedContent = decryptedBuffer.toString('utf-8');

    if (decryptedContent === content) {
        console.log("✅ SUCCESS: Decryption matches original content.");
    } else {
        console.error("❌ FAILURE: Decryption mismatch.");
        console.log(`Expected: ${content}`);
        console.log(`Got: ${decryptedContent}`);
    }

    // Cleanup
    fs.unlinkSync(fullPath);
    console.log("🧹 Cleanup complete.");
}

verifyEncryption()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
