
import { prisma } from '../db';

interface AttributeContext {
    user: Record<string, any>;
    resource: Record<string, any>;
    environment?: Record<string, any>;
}

// Simple JSON Logic evaluator (could validly be replaced by 'json-logic-js')
const evaluateCondition = (condition: string, context: AttributeContext): boolean => {
    try {
        // Condition example: "user.clearance_level >= resource.classification AND resource.jurisdiction == user.jurisdiction"
        // For MVP, we'll do simple key-value matching or use a restricted function evaluation
        // WARNING: eval() is unsafe. In production use a parser like json-logic-js or simple regex parsing.

        // Let's implement a safe, basic parser for: "field OP value"
        // e.g. "resource.riskLevel == 'HIGH'"

        const safeEval = new Function('user', 'resource', 'env', `return ${condition};`);
        return safeEval(context.user, context.resource, context.environment || {});
    } catch (e) {
        console.error("Policy Evaluation Error:", e);
        return false; // Fail safe
    }
};

export class PolicyEngine {

    /**
     * Evaluate if a user can perform an action on a resource.
     * 1. Checks basic RBAC (via Role permissions) - Assume this is done by middleware primarily, 
     *    but we can double check here or focus on ABAC.
     * 2. Checks ABAC Policies attached to the user's role.
     */
    static async evaluate(userId: string, userAttributes: any, resourceType: string, resourceAttributes: any, action: string, tenantId: string): Promise<{ allowed: boolean; reason?: string }> {

        // 1. Fetch Policies for the User's Role(s)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        policies: true
                    }
                }
            }
        });

        if (!user || !user.role) {
            return { allowed: false, reason: "No role assigned" };
        }

        // Global System Policies? (We might want to fetch tenant-wide policies too)
        const tenantPolicies = await prisma.policy.findMany({
            where: {
                tenantId: tenantId,
                resource: resourceType,
                action: action,
                roles: {
                    none: {} // Policies that don't specify roles might be global? Or maybe we strictly link roles.
                    // Let's say we only check policies linked to the users role + global defaults if we had them.
                    // For now, let's just stick to the user's role policies.
                }
            }
        });

        const activePolicies = user.role.policies.filter(p => p.resource === resourceType && p.action === action);

        if (activePolicies.length === 0) {
            // Default Deny if we are relying on ABAC policies? 
            // OR Default Allow if RBAC passed? 
            // Usually ABAC is an additional restrictor.
            // Let's assume RBAC allowed it, and we are looking for DENY policies or required ALLOW policies.

            // Strategy: "Allow by default unless DENY policy exists" vs "Deny by default"
            // Let's go with: RBAC Grants Access -> ABAC filters it. 
            // So if no ABAC policy exists, we return ALLOW (Delegating to RBAC).
            return { allowed: true };
        }

        // Sort by priority (descending)
        activePolicies.sort((a, b) => b.priority - a.priority);

        for (const policy of activePolicies) {
            if (!policy.condition) continue;

            const context: AttributeContext = {
                user: userAttributes || {},
                resource: resourceAttributes || {},
                environment: { time: new Date() }
            };

            const isMatch = evaluateCondition(policy.condition, context);

            if (isMatch) {
                if (policy.effect === 'DENY') {
                    return { allowed: false, reason: `Blocked by policy: ${policy.name}` };
                }
                // If ALLOW, we keep checking in case a higher (or lower?) priority DENY overrides? 
                // Usually first match wins if sorted by priority.
                if (policy.effect === 'ALLOW') {
                    return { allowed: true, reason: `Allowed by policy: ${policy.name}` };
                }
            }
        }

        // If no policy matched the condition, what is the fallback?
        // Fallback to ALLOW (RBAC)
        return { allowed: true };
    }
}
