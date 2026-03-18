import { Prisma } from '@prisma/client';

export function tenantIsolationMiddleware(currentTenantIdProvider: () => string | undefined): Prisma.Middleware {
    return async (params, next) => {
        const tenantId = currentTenantIdProvider();

        // Models that require isolation
        const ISOLATED_MODELS = [
            'Matter', 'User', 'Role', 'Policy', 'Document', 'AuditLog', 
            'Task', 'Deadline', 'TimeEntry', 'CollaborationMessage', 
            'AIRiskAnalysis', 'ActivityEntry', 'Approval', 'PredictiveRisk',
            'ContractMetadata', 'CaseMetadata', 'Hearing', 'EvidenceLink',
            'DocumentVersion', 'ActivityEntry', 'AIUsage', 'BrandingProfile',
            'Department'
        ];

        if (params.model && ISOLATED_MODELS.includes(params.model) && tenantId) {
            // Ensure args exists
            if (!params.args) params.args = {};

            // Role and Policy models allow system-wide records OR tenant-specific ones
            const isSharedModel = ['Role', 'Permission', 'Policy'].includes(params.model);

            if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
                const isolationFilter = isSharedModel
                    ? { OR: [{ tenantId: tenantId }, { isSystem: true }] }
                    : { tenantId: tenantId };

                // [SECURITY FIX] findUnique does not support AND/OR clauses in 'where'. 
                // We convert findUnique to findFirst to allow safe multi-tenant filtering.
                if (params.action === 'findUnique') {
                    params.action = 'findFirst';
                }

                // Safely merge filters using AND to prevent overwriting existing OR/AND clauses
                params.args.where = {
                    AND: [
                        params.args.where || {},
                        isolationFilter
                    ]
                };
            }

            if (params.action === 'create' && !isSharedModel) {
                params.args.data = {
                    ...(params.args.data || {}),
                    tenantId: tenantId,
                };
            }

            if (params.action === 'update' || params.action === 'updateMany' || params.action === 'delete' || params.action === 'deleteMany') {
                params.args.where = {
                    ...(params.args.where || {}),
                    tenantId: tenantId,
                };
            }
        }

        return next(params);
    };
}
