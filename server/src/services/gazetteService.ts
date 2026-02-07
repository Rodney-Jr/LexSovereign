import crypto from 'crypto';
import { prisma } from '../db';
import { RegulatoryRule, Region } from '../types';

/**
 * Gazette Service
 * Handles "Statutory Sync" from the Official Gazette.
 * Enforces cryptographic chain-of-custody for all regional rule updates.
 * This is the heart of "Hard-Pinned Compliance".
 */

// Pinned Public Key of the regional authority (e.g. Ghana DPA or South Africa Info Regulator)
// Any statutory update NOT signed by this key is rejected as "Shadow Law".
const REGIONAL_AUTHORITY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxz...PINNED_AUTHORITY...
-----END PUBLIC KEY-----`;

export class GazetteService {

    /**
     * Verifies and ingests a statutory update from a trusted sovereign source.
     */
    static async ingestUpdate(payload: any, signature: string): Promise<{ success: boolean; message: string }> {
        console.log('[Gazette] Static Sync Initiation...');

        // 1. Cryptographic Chain-of-Custody Check
        const isValid = this.verifyAuthority(payload, signature);

        if (!isValid) {
            console.error('[Gazette] CRITICAL: Invalid Signature. Statutory update rejected to prevent regulatory contamination.');
            return { success: false, message: 'Invalid Authority Signature. Sovereign enclave rejected the instrument.' };
        }

        console.log('[Gazette] Authority Verified: Regional Data Protection Commission.');

        // 2. Atomic Rule Enforcement
        const updates = payload.updates || [];
        let appliedCount = 0;

        for (const update of updates) {
            // Upsert Rule into the Hard-Pinned RRE
            await prisma.regulatoryRule.upsert({
                where: { id: update.id },
                update: {
                    name: update.name,
                    description: update.description,
                    isActive: update.isActive,
                    authority: update.authority,
                    triggerKeywords: update.triggerKeywords,
                    blockThreshold: update.blockThreshold,
                    region: update.region // Scoped update
                },
                create: {
                    id: update.id,
                    name: update.name,
                    description: update.description,
                    region: update.region || Region.PRIMARY,
                    isActive: update.isActive,
                    authority: update.authority,
                    triggerKeywords: update.triggerKeywords,
                    blockThreshold: update.blockThreshold
                }
            });
            appliedCount++;
        }

        console.log(`[Gazette] Successfully pinned ${appliedCount} statutory instruments to the enclave.`);
        return { success: true, message: `Hard-pinned ${appliedCount} rules.` };
    }

    private static verifyAuthority(payload: any, signature: string): boolean {
        try {
            // Development override for demo purposes
            if (process.env.NODE_ENV === 'development' && signature.startsWith('sov_authority_')) {
                return true;
            }

            // Real Industrial-Grade RSA-SHA256 Verification
            const verify = crypto.createVerify('SHA256');
            verify.update(JSON.stringify(payload));
            verify.end();

            return verify.verify(REGIONAL_AUTHORITY_PUBLIC_KEY, signature, 'base64');
        } catch (error) {
            console.error('[Gazette] Cryptographic Verification Engine Failure:', error);
            return false;
        }
    }
}
