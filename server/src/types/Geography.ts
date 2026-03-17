
export enum Jurisdiction {
    GHANA = 'GH_ACC_1',
    NIGERIA = 'NG_LOS_1',
    UK = 'UK_LON_1',
    USA = 'US_EAS_1',
    GLOBAL = 'GL_ALL_1'
}

export interface RegionalResources {
    s3Bucket: string;
    vectorNamespace: string;
    aiEndpoint: string; // Internal vLLM or public gateway
    isResidencyStrict: boolean;
}

export const JURISDICTION_METADATA: Record<Jurisdiction, RegionalResources> = {
    [Jurisdiction.GHANA]: {
        s3Bucket: 'sov-gh-acc-01-vault',
        vectorNamespace: 'gh-acc-v1',
        aiEndpoint: 'http://gh-gpu-cl-01:8000/v1',
        isResidencyStrict: true
    },
    [Jurisdiction.NIGERIA]: {
        s3Bucket: 'sov-ng-los-01-vault',
        vectorNamespace: 'ng-los-v1',
        aiEndpoint: 'http://ng-gpu-cl-01:8000/v1',
        isResidencyStrict: true
    },
    [Jurisdiction.UK]: {
        s3Bucket: 'sov-uk-lon-01-vault',
        vectorNamespace: 'uk-lon-v1',
        aiEndpoint: 'https://api.openai.com/v1', // Fallback to public if no local cluster
        isResidencyStrict: false
    },
    [Jurisdiction.USA]: {
        s3Bucket: 'sov-us-eas-01-vault',
        vectorNamespace: 'us-eas-v1',
        aiEndpoint: 'https://api.openai.com/v1',
        isResidencyStrict: false
    },
    [Jurisdiction.GLOBAL]: {
        s3Bucket: 'sov-gl-all-01-vault',
        vectorNamespace: 'gl-all-v1',
        aiEndpoint: 'https://api.openai.com/v1',
        isResidencyStrict: false
    }
};
