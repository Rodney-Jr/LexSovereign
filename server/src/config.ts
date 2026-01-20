
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

export const CONFIG = {
    DEPLOYMENT_MODE: process.env.DEPLOYMENT_MODE || 'SAAS', // 'SAAS' | 'ON_PREM'
    SINGLE_TENANT_ID: process.env.SINGLE_TENANT_ID || 'sovereign-enclave-001',
    IS_AIR_GAPPED: process.env.IS_AIR_GAPPED === 'true',

    // Feature Flags based on deployment
    ENABLE_MULTI_TENANCY: (process.env.DEPLOYMENT_MODE || 'SAAS') === 'SAAS',
    ENABLE_CLOUD_SYNC: (process.env.DEPLOYMENT_MODE || 'SAAS') === 'SAAS'
};
