
import { Request, Response, NextFunction } from 'express';

export const moduleGuard = (requiredModule: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const tenant = (req as any).user?.tenant;

        if (!tenant) {
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
