import { Readable } from 'stream';

export interface FileMetadata {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    metadata?: Record<string, string>;
}

export interface EncryptionContext {
    keyId: string;
    algorithm: 'AES-256-GCM';
    iv: string; // Base64
}

export interface IStoragePort {
    readonly providerId: string;

    /**
     * Upload a file stream to the storage provider.
     * @param fileStream The readable stream of the file content.
     * @param metadata Metadata associated with the file.
     * @param encryptionContext Optional encryption context if the file is pre-encrypted.
     * @returns The unique identifier of the stored file (e.g., S3 Key, OneDrive Item ID).
     */
    upload(
        fileStream: Readable,
        metadata: FileMetadata,
        encryptionContext?: EncryptionContext
    ): Promise<string>;

    /**
     * Retrieve a file stream from the storage provider.
     * @param fileId The unique identifier of the file.
     * @returns A readable stream of the file content.
     */
    download(fileId: string): Promise<Readable>;

    /**
     * Permanently delete a file from the storage provider.
     * Required for GDPR / Right to be Forgotten compliance.
     * @param fileId The unique identifier of the file.
     * @returns True if deletion was successful.
     */
    delete(fileId: string): Promise<boolean>;

    /**
     * Check if the storage provider is reachable and authenticated.
     */
    healthCheck(): Promise<boolean>;
}
