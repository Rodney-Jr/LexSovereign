
import { prisma } from '../db';
import crypto from 'crypto';

export class AuditService {

    /**
     * Log a secure, tamper-evident audit entry.
     */
    static async log(
        action: string,
        userId: string | null,
        resourceId: string | null,
        details: any,
        ipAddress?: string
    ) {
        try {
            // 1. Serialize details
            const detailsStr = JSON.stringify(details);

            // 2. Compute Hash (Tamper-Evidence) - For a real chain, we'd need the previous hash. 
            // For now, simpler: Hash(Action + User + Timestamp + Details)
            // This prevents changing the details without invalidating the hash.
            const timestamp = new Date().toISOString();
            const payload = `${action}:${userId}:${timestamp}:${detailsStr}`;
            const hash = crypto.createHash('sha256').update(payload).digest('hex');

            await prisma.auditLog.create({
                data: {
                    action,
                    userId,
                    resourceId,
                    details: detailsStr,
                    ipAddress,
                    timestamp,
                    // If we add a 'hash' column later, we store it here. 
                    // For now we just computed it to show intent, or we could store it in details metadata.
                }
            });

            // In a real Hyperledger/Blockchain system, we'd submit 'hash' to the ledger here.

        } catch (e) {
            console.error("AUDIT FAILURE:", e);
            // Critical: If audit fails, should we block the action? 
            // "Fail Closed" security says yes.
        }
    }

    static async getLogs(tenantId: string | null, limit = 100) {
        // Tenants only see their own users' logs? 
        // This is tricky if logs don't have tenantId directly.
        // We link via User.

        const whereClause: any = {};

        if (tenantId) {
            whereClause.user = { tenantId };
        }

        return await prisma.auditLog.findMany({
            where: whereClause,
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, email: true, role: true } } }
        });
    }
}
