import { Request, Response, NextFunction } from 'express';
import { prisma, requestContext } from '../db';
import crypto from 'crypto';

/**
 * Validates the x-api-key header for automated agent requests.
 * If valid, attaches the tenantId to the request context to ensure isolation.
 */
export const authenticateAgentKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing x-api-key header' });
    }

    try {
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Note: Run without tenant isolation to find the key globally, 
        // then we establish the tenant context for the rest of the request.
        const keyRecord = await requestContext.run({ tenantId: undefined, userId: undefined }, () =>
            prisma.apiKey.findUnique({
                where: { keyHash },
                include: { tenant: { select: { status: true } } }
            })
        );

        if (!keyRecord || !keyRecord.isActive) {
            console.error('[AgentAuth] Invalid or inactive API key attempt.');
            return res.status(403).json({ error: 'Invalid API Key' });
        }

        if (keyRecord.tenant?.status === 'SUSPENDED') {
            console.warn(`[AgentAuth] Attempted access for suspended tenant: ${keyRecord.tenantId}`);
            return res.status(403).json({ error: 'Tenant is suspended' });
        }

        // Update last used timestamp asynchronously
        prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsed: new Date() }
        }).catch(err => console.error('[AgentAuth] Failed to update lastUsed:', err));

        // Establish the secure tenant context for all subsequent DB operations in this request
        requestContext.run({ tenantId: keyRecord.tenantId, userId: `agent-${keyRecord.id}` }, () => {
            req.agentContext = {
                tenantId: keyRecord.tenantId,
                keyId: keyRecord.id,
                name: keyRecord.name
            };
            next();
        });

    } catch (err) {
        console.error('[AgentAuth] Authentication Exception:', err);
        res.status(500).json({ error: 'Authentication processing error' });
    }
};
