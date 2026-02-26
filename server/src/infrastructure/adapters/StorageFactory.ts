import { IStoragePort } from '../../core/ports/IStoragePort';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export enum StorageType {
    LOCAL = 'LOCAL',
    ONEDRIVE = 'ONEDRIVE', // Future: Microsoft OneDrive Adapter
    S3 = 'S3'             // Future: AWS S3 Adapter
}

export class StorageFactory {
    static getAdapter(type: StorageType, config?: any): IStoragePort {
        switch (type) {
            case StorageType.LOCAL:
                return new LocalStorageAdapter(config?.path);
            case StorageType.ONEDRIVE:
                throw new Error("OneDrive Adapter not implemented");
            case StorageType.S3:
                throw new Error("S3 Adapter not implemented");
            default:
                return new LocalStorageAdapter(); // Default to local
        }
    }
}
