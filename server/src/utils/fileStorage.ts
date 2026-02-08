import fs from 'fs';
import path from 'path';
import { EncryptionContext } from '../core/ports/IStoragePort';
import { createCipheriv } from 'crypto';

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

/**
 * Saves content to a file within the uploads directory.
 * @param tenantId The tenant ID (used for folder structure)
 * @param matterId The matter ID (used for folder structure)
 * @param fileName The name of the file
 * @param content The content to write
 * @param encryptionContext Optional encryption context
 * @returns The relative path to the saved file
 */
export const saveDocumentContent = async (
    tenantId: string,
    matterId: string,
    fileName: string,
    content: string,
    encryptionContext?: EncryptionContext
): Promise<string> => {
    // Sanitize inputs to prevent directory traversal
    const safeTenantId = tenantId.replace(/[^a-zA-Z0-9-]/g, '');
    const safeMatterId = matterId.replace(/[^a-zA-Z0-9-]/g, '');
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    const targetDir = path.join(UPLOAD_ROOT, safeTenantId, safeMatterId);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, safeFileName);

    let finalData: string | Buffer = content;
    if (encryptionContext) {
        const key = Buffer.alloc(32, encryptionContext.keyId);
        const iv = Buffer.from(encryptionContext.iv, 'base64');
        const cipher = createCipheriv('aes-256-gcm', key, iv);

        finalData = Buffer.concat([
            cipher.update(content, 'utf8'),
            cipher.final()
        ]);
    }

    // Write content
    await fs.promises.writeFile(filePath, finalData);

    // Return relative path for database storage (platform independent format)
    return path.join(safeTenantId, safeMatterId, safeFileName).replace(/\\/g, '/');
};

/**
 * Reads document content from disk.
 * @param relativePath The relative path stored in the database
 * @returns The content of the file
 */
export const readDocumentContent = async (relativePath: string): Promise<string> => {
    // Sanitize to prevent traversal above root
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(UPLOAD_ROOT, safePath);

    if (!fullPath.startsWith(UPLOAD_ROOT)) {
        throw new Error("Access denied: Invalid path");
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error("File not found");
    }

    return fs.promises.readFile(fullPath, 'utf-8');
};
