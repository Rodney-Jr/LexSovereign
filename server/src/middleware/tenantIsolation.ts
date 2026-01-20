import { Prisma } from '@prisma/client';

export function tenantIsolationMiddleware(currentTenantIdProvider: () => string | undefined): Prisma.Middleware {
    return async (params, next) => {
        const tenantId = currentTenantIdProvider();

        // Models that require isolation
        const ISOLATED_MODELS = ['Matter', 'Document', 'TimeEntry', 'PredictiveRisk', 'AuditLog'];

        if (params.model && ISOLATED_MODELS.includes(params.model) && tenantId) {
            if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
                params.args.where = {
                    ...params.args.where,
                    tenantId: tenantId,
                };
            }

            if (params.action === 'create') {
                params.args.data = {
                    ...params.args.data,
                    tenantId: tenantId,
                };
            }

            if (params.action === 'update' || params.action === 'updateMany' || params.action === 'delete' || params.action === 'deleteMany') {
                params.args.where = {
                    ...params.args.where,
                    tenantId: tenantId,
                };
            }
        }

        return next(params);
    };
}
