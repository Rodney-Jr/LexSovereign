import fs from 'fs';
import path from 'path';
import { EncryptionContext } from '../core/ports/IStoragePort';
import { createCipheriv } from 'crypto';

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
import { StorageRouterService } from '../services/StorageRouterService';
import { Jurisdiction } from '../types/Geography';

/**
 * Saves content to a file within the uploads directory.
 * @param tenant The tenant object containing id, jurisdiction, and optional storageBucketUri
 * @param matterId The matter ID (used for folder structure)
 * @param fileName The name of the file
 * @param content The content to write
 * @param encryptionContext Optional encryption context
 * @returns The relative path to the saved file
 */
export const saveDocumentContent = async (
    tenant: { id: string; jurisdiction: string; storageBucketUri?: string | null },
    matterId: string,
    fileName: string,
    content: string | Buffer,
    encryptionContext?: EncryptionContext
): Promise<string> => {
    // Sanitize inputs to prevent directory traversal
    const safeTenantId = tenant.id.replace(/[^a-zA-Z0-9-]/g, '');
    const safeMatterId = matterId.replace(/[^a-zA-Z0-9-]/g, '');
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Use StorageRouter to find the correct regional path
    const regionalPath = StorageRouterService.resolveDocumentPath(tenant, '');
    const targetDir = path.join(__dirname, '../../', regionalPath, safeMatterId);

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

        const input = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
        finalData = Buffer.concat([
            cipher.update(input),
            cipher.final()
        ]);
    }

    // Write content
    await fs.promises.writeFile(filePath, finalData);

    // Return relative path for database storage (platform independent format)
    // We return the path from the project root (excluding the absolute part)
    return path.join(regionalPath, safeMatterId, safeFileName).replace(/\\/g, '/');
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
