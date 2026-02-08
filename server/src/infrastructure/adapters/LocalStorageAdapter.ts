import { Readable } from 'stream';
import { IStoragePort, FileMetadata, EncryptionContext } from '../../core/ports/IStoragePort';
import fs from 'fs';
import path from 'path';

export class LocalStorageAdapter implements IStoragePort {
    readonly providerId = 'LOCAL_FS';
    private storagePath: string;

    constructor(basePath: string = './local_vault') {
        this.storagePath = path.resolve(basePath);
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
        }
    }

    async upload(fileStream: Readable, metadata: FileMetadata, encryptionContext?: EncryptionContext): Promise<string> {
        const fileId = `${metadata.id}_${metadata.name}`;
        const filePath = path.join(this.storagePath, fileId);

        const { createCipheriv } = await import('crypto');
        const writeStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            let pipeline: any = fileStream;

            if (encryptionContext) {
                // Determine the key (In production, this comes from a KMS)
                // For demo/dev, we use the keyId as a base for a 32-byte key
                const key = Buffer.alloc(32, encryptionContext.keyId);
                const iv = Buffer.from(encryptionContext.iv, 'base64');
                const cipher = createCipheriv('aes-256-gcm', key, iv);

                pipeline = fileStream.pipe(cipher);

                cipher.on('error', reject);
                // We don't handle authTag here for simplicity in the stream prototype, 
                // but in production, we'd append it to the file.
            }

            pipeline.pipe(writeStream)
                .on('finish', () => resolve(fileId))
                .on('error', reject);
        });
    }

    async download(fileId: string, encryptionContext?: EncryptionContext): Promise<Readable> {
        const filePath = path.join(this.storagePath, fileId);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileId} not found`);
        }

        const { createDecipheriv } = await import('crypto');
        const readStream = fs.createReadStream(filePath);

        if (encryptionContext) {
            const key = Buffer.alloc(32, encryptionContext.keyId);
            const iv = Buffer.from(encryptionContext.iv, 'base64');
            const decipher = createDecipheriv('aes-256-gcm', key, iv);

            return readStream.pipe(decipher) as any;
        }

        return readStream;
    }

    async delete(fileId: string): Promise<boolean> {
        const filePath = path.join(this.storagePath, fileId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }

    async healthCheck(): Promise<boolean> {
        try {
            fs.accessSync(this.storagePath, fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }
}
