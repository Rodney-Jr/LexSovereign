import fs from 'fs';
import path from 'path';

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

/**
 * Saves content to a file within the uploads directory.
 * @param tenantId The tenant ID (used for folder structure)
 * @param matterId The matter ID (used for folder structure)
 * @param fileName The name of the file
 * @param content The content to write
 * @returns The relative path to the saved file
 */
export const saveDocumentContent = async (
    tenantId: string,
    matterId: string,
    fileName: string,
    content: string
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

    // Write content
    await fs.promises.writeFile(filePath, content, 'utf-8');

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
