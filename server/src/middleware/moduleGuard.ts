
import { Request, Response, NextFunction } from 'express';

export const moduleGuard = (requiredModule: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const tenant = (req as any).user?.tenant;

        if (!tenant) {
            return res.status(401).json({ error: "Tenant context missing" });
        }

        const enabledModules = tenant.enabledModules || ["CORE"];

        if (!enabledModules.includes(requiredModule) && !enabledModules.includes("ALL")) {
            return res.status(402).json({
                error: "Payment Required",
                message: `The '${requiredModule}' module is not enabled for this tenant.`,
                module: requiredModule
            });
        }

        next();
    };
};
