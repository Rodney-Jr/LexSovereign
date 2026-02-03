
import { Request, Response, NextFunction } from 'express';
import { PolicyEngine } from '../services/policyEngine';
import { prisma } from '../db';

/**
 * AI Guard Middleware
 * Enforces Human-in-the-Loop and RBAC+ABAC for AI actions.
 */
export const aiGuard = (requiredAction: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const { modelId, context, confidenceThreshold } = req.body;

            // 1. Basic Policy Check (ABAC)
            // Resource: "AI_MODEL"
            // Attributes: { modelId, riskLevel: context?.riskLevel }
            const attributes = {
                modelId,
                riskLevel: context?.riskLevel || 'UNKNOWN'
            };

            const policyResult = await PolicyEngine.evaluate(
                user.userId,
                user.attributes || {},
                'AI_MODEL',
                attributes,
                requiredAction,
                user.tenantId
            );

            if (!policyResult.allowed) {
                return res.status(403).json({ error: policyResult.reason });
            }

            // 2. High-Stakes Override Check
            // If this is an "EXECUTE" or "SIGN" action, or if confidence is low, strictly require OVERRIDE permission
            if (requiredAction === 'AI_EXECUTE' || (confidenceThreshold && confidenceThreshold < 0.8)) {
                // Check if user has explicit 'override_ai' permission (RBAC)
                // This assumes permissions are loaded in req.user or we fetch them
                // Let's verify against the DB for critical actions

                const userWithRole = await prisma.user.findUnique({
                    where: { id: user.userId },
                    include: {
                        role: { include: { permissions: true } }
                    }
                });

                const canOverride = (userWithRole?.role as any)?.permissions.some((p: any) => p.id === 'ai_override');

                if (!canOverride) {
                    // Log the blocked attempt
                    await prisma.auditLog.create({
                        data: {
                            action: 'AI_OVERRIDE_BLOCK',
                            userId: user.userId,
                            resourceId: modelId,
                            details: JSON.stringify({ reason: 'Confidence low, missing override permission' })
                        }
                    });

                    return res.status(403).json({
                        error: 'AI Confidence below threshold. Human authorization (General Counsel) required to proceed.',
                        requiresOverride: true
                    });
                }
            }

            // Log successful AI access for audit
            // We don't await this to avoid latency, but in a strict system we might.
            prisma.auditLog.create({
                data: {
                    action: `AI_ACCESS_${requiredAction}`,
                    userId: user.userId,
                    resourceId: modelId,
                    details: JSON.stringify({ context })
                }
            }).catch(console.error);

            return next();
        } catch (error: any) {
            console.error("AI Guard Error:", error);
            return res.status(500).json({ error: 'AI Governance Check Failed' });
        }
    };
};
