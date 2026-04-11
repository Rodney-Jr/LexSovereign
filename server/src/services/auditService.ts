import { prisma } from '../db';
import crypto from 'crypto';

export class AuditService {
    private static readonly GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

    /**
     * Log a secure, tamper-evident audit entry with Hash Chaining.
     */
    static async log(
        action: string,
        userId: string | null,
        tenantId: string | null, // Now required for chaining scope
        resourceId: string | null,
        details: any,
        ipAddress?: string
    ) {
        try {
            // 1. Fetch the latest hash for this tenant to maintain the chain
            const latestLog = await prisma.auditLog.findFirst({
                where: { tenantId },
                orderBy: { timestamp: 'desc' }
            });

            const previousHash = latestLog ? latestLog.hash : this.GENESIS_HASH;

            // 2. Serialize and setup payload
            const detailsStr = JSON.stringify(details);
            const timestamp = new Date().toISOString();

            // 3. Compute Hash (Action + User + Timestamp + Details + PreviousHash)
            // This is the core of the "Immutable" Proof.
            const payload = `${action}:${userId}:${tenantId}:${timestamp}:${detailsStr}:${previousHash}`;
            const hash = crypto.createHash('sha256').update(payload).digest('hex');

            await prisma.auditLog.create({
                data: {
                    action,
                    userId,
                    tenantId,
                    resourceId,
                    details: detailsStr,
                    ipAddress,
                    timestamp,
                    hash,
                    previousHash
                }
            });

            console.log(`[Audit] Chained Entry: ${action} -> Hash: ${hash.substring(0, 8)}...`);
        } catch (e) {
            console.error("CRITICAL AUDIT FAILURE:", e);
            // In a production regulated environment, we would throw here to fail-closed
        }
    }

    /**
     * Verify the integrity of the audit chain for a specific tenant.
     * Returns true if the chain is valid, false if tampering is detected.
     */
    static async verifyTenantIntegrity(tenantId: string): Promise<{ isValid: boolean; brokenAt?: string }> {
        const logs = await prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { timestamp: 'asc' }
        });

        let currentPrevHash = this.GENESIS_HASH;

        for (const log of logs) {
            // Recompute what the hash SHOULD be
            const payload = `${log.action}:${log.userId}:${log.tenantId}:${log.timestamp.toISOString()}:${log.details}:${currentPrevHash}`;
            const expectedHash = crypto.createHash('sha256').update(payload).digest('hex');

            if (log.hash !== expectedHash || log.previousHash !== currentPrevHash) {
                return { isValid: false, brokenAt: log.id };
            }

            currentPrevHash = log.hash;
        }

        return { isValid: true };
    }

    static async getLogs(tenantId: string | null, limit = 100) {
        const whereClause: any = {};
        if (tenantId) whereClause.tenantId = tenantId;

        return await prisma.auditLog.findMany({
            where: whereClause,
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, email: true, roleString: true } } }
        });
    }
}
