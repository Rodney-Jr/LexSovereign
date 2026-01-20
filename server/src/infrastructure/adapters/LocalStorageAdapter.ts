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

        const writeStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            fileStream.pipe(writeStream)
                .on('finish', () => resolve(fileId))
                .on('error', reject);
        });
    }

    async download(fileId: string): Promise<Readable> {
        const filePath = path.join(this.storagePath, fileId);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileId} not found`);
        }
        return fs.createReadStream(filePath);
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
