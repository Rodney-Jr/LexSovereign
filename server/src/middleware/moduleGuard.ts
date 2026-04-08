
import { Request, Response, NextFunction } from 'express';

export const moduleGuard = (requiredModule: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // Global Admins have platform-wide access, bypass module guard
        if (user?.role === 'GLOBAL_ADMIN') {
            return next();
        }

        const tenant = user?.tenant;

        if (!tenant) {
            // Check if tenant options are passed in the top-level user object (JWT mapping)
            if (user?.tenantId === '__PLATFORM__') {
               return next();
            }
            res.status(401).json({ error: "Tenant context missing" });
            return;
        }

        const enabledModules = tenant.enabledModules || ["CORE"];

        // ACCOUNTING_HUB and HR_ENTERPRISE are now free for all tenants
        const isFreeModule = requiredModule === "ACCOUNTING_HUB" || requiredModule === "HR_ENTERPRISE";

        if (!isFreeModule && !enabledModules.includes(requiredModule) && !enabledModules.includes("ALL")) {
            return res.status(402).json({
                error: "Payment Required",
                message: `The '${requiredModule}' module is not enabled for this tenant.`,
                module: requiredModule
            });
        }

        return next();
    };
};
