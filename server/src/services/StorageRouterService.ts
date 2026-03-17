
import { Tenant } from '@prisma/client';
import { Jurisdiction, JURISDICTION_METADATA, RegionalResources } from '../types/Geography';

export class StorageRouterService {
    /**
     * Determines the correct storage and AI resources for a given tenant.
     * This ensures data sovereignty by pointing the application to jurisdictional-specific buckets.
     */
    static getRegionalConfig(tenant: { jurisdiction: string, storageBucketUri?: string | null }): RegionalResources {
        // Use the tenant's specific override if available, otherwise fallback to the default for their jurisdiction
        const jurisdiction = (tenant.jurisdiction || Jurisdiction.GLOBAL) as Jurisdiction;
        const defaultConfig = JURISDICTION_METADATA[jurisdiction] || JURISDICTION_METADATA[Jurisdiction.GLOBAL];

        return {
            ...defaultConfig,
            s3Bucket: tenant.storageBucketUri || defaultConfig.s3Bucket
        };
    }

    /**
     * Resolves the physical path for a document based on residency status.
     * In a production environment, this would interface with S3 or a local NAS mount.
     */
    static resolveDocumentPath(tenant: { id: string, jurisdiction: string }, filename: string): string {
        const config = this.getRegionalConfig(tenant);
        // For local development simulation, we use subdirectories as silos
        return `uploads/${config.s3Bucket}/${tenant.id}/${filename}`;
    }
}
