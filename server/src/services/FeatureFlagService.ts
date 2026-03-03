import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum FeatureModule {
    CLM = 'module:clm',
    LITIGATION = 'module:litigation',
    AI_INTELLIGENCE = 'module:ai_intelligence',
    ENTERPRISE_GOVERNANCE = 'module:enterprise_governance'
}

export class FeatureFlagService {
    /**
     * Check if a feature module is enabled for a specific tenant
     * Use Tenant attributes JSON for persistent storage of flags
     */
    static async isEnabled(tenantId: string, feature: FeatureModule): Promise<boolean> {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        });

        if (!tenant) return false;

        const attributes = (tenant.attributes as Record<string, any>) || {};
        const flags = attributes.featureFlags || {};

        // Default to true if not explicitly set, or handle strictly based on plan
        // For this implementation, we check if the flag is explicitly true
        return !!flags[feature];
    }

    /**
     * Enable or disable a feature for a tenant
     */
    static async setFeatureStatus(tenantId: string, feature: FeatureModule, enabled: boolean) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) throw new Error('Tenant not found');

        const attributes = (tenant.attributes as Record<string, any>) || {};
        const featureFlags = attributes.featureFlags || {};

        featureFlags[feature] = enabled;
        attributes.featureFlags = featureFlags;

        return await prisma.tenant.update({
            where: { id: tenantId },
            data: { attributes }
        });
    }
}
