import { Prisma } from '@prisma/client';

export function tenantIsolationMiddleware(currentTenantIdProvider: () => string | undefined): Prisma.Middleware {
    return async (params, next) => {
        const tenantId = currentTenantIdProvider();

        // Models that require isolation
        const ISOLATED_MODELS = ['Matter', 'User', 'Role', 'Policy'];

        if (params.model && ISOLATED_MODELS.includes(params.model) && tenantId) {
            // Role and Policy models allow system-wide records OR tenant-specific ones
            const isSharedModel = ['Role', 'Permission', 'Policy'].includes(params.model);

            if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
                const isolationFilter = isSharedModel
                    ? { OR: [{ tenantId: tenantId }, { isSystem: true }] }
                    : { tenantId: tenantId };

                params.args.where = {
                    ...(params.args.where || {}),
                    ...isolationFilter
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
