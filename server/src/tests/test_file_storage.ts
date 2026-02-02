
import path from 'path';
import fs from 'fs';
import { saveDocumentContent, readDocumentContent } from '../utils/fileStorage';

const TEST_TENANT = 'test-tenant-123';
const TEST_MATTER = 'test-matter-456';
const TEST_FILE = 'contract.md';
const TEST_CONTENT = '# Confidential Contract\n\nThis is a test content.';

async function runStorageTest() {
    console.log("🧪 Testing FileStorage Utility...");

    try {
        // 1. Test Writing
        console.log(`\n📝 Writing file: ${TEST_FILE}`);
        const savedPath = await saveDocumentContent(TEST_TENANT, TEST_MATTER, TEST_FILE, TEST_CONTENT);
        console.log(`✅ File saved at relative path: ${savedPath}`);

        // Verify file exists on disk
        const fullPath = path.join(__dirname, '../../uploads', savedPath);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ Verified file exists on disk: ${fullPath}`);
        } else {
            console.error(`❌ File NOT found on disk at: ${fullPath}`);
            process.exit(1);
        }

        // 2. Test Reading by Relative Path
        console.log(`\n📖 Reading file from: ${savedPath}`);
        const readContent = await readDocumentContent(savedPath);

        if (readContent === TEST_CONTENT) {
            console.log("✅ Read content matches written content!");
        } else {
            console.error("❌ Content mismatch!");
            console.error("Expected:", TEST_CONTENT);
            console.error("Got:", readContent);
            process.exit(1);
        }

        // 3. Test Directory Traversal Protection (Write)
        console.log(`\n🛡️ Testing Directory Traversal Protection (Write)`);
        const hackPath = await saveDocumentContent(TEST_TENANT, TEST_MATTER, '../../hack.txt', 'hacked');
        console.log(`Output Path for traversal attempt: ${hackPath}`);
        if (!hackPath.includes('..')) {
            console.log("✅ Traversal characters sanitized from filename.");
        }

        // 4. Test Directory Traversal Protection (Read)
        console.log(`\n🛡️ Testing Directory Traversal Protection (Read)`);
        try {
            await readDocumentContent('../../src/index.ts');
            console.error("❌ Failed to block traversal read!");
        } catch (e: any) {
            console.log(`✅ Blocked traversal read request: ${e.message}`);
        }

        console.log("\n✨ All Storage Tests Passed!");

        // Cleanup
        try {
            fs.unlinkSync(fullPath);
        } catch (e) { }

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e);
        process.exit(1);
    }
}

runStorageTest();
