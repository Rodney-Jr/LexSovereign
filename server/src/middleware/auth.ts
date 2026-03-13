import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { prisma, requestContext } from '../db';
import { CONFIG } from '../config';

import { AuthUser } from '../types';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Priority: 1. HttpOnly Cookie (hardened), 2. Authorization header (legacy/API compatibility)
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1];
    const token = cookieToken || headerToken;

    console.log(`[Auth-Diag] Request to ${req.originalUrl || req.url} | Cookie: ${cookieToken ? 'Y' : 'N'} | Header: ${authHeader ? 'Y' : 'N'} | Token: ${token ? (token === 'undefined' ? 'UNDEFINED_STR' : 'EXISTS') : 'MISSING'}`);

    if (!token || token === 'undefined') {
        res.sendStatus(401); // Unauthorized
        return;
    }

    jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
        if (err) {
            console.error(`[Auth] JWT Verification failed: ${err.message}`);
            return res.status(403).json({
                error: 'Invalid session token',
                code: 'FORBIDDEN',
                reason: err.message === 'jwt expired' ? 'expired' : 'invalid'
            });
        }

        try {
            // Check User & Tenant Status
            const dbUser: any = await requestContext.run({ tenantId: user.tenantId, userId: user.id }, () =>
                (prisma as any).user.findUnique({
                    where: { id: user.id },
                    include: {
                        tenant: { select: { status: true, enabledModules: true, isTrial: true, trialExpiresAt: true } },
                        department: true
                    }
                })
            );

            if (!dbUser || !dbUser.isActive) {
                return res.status(403).json({ error: 'Account disabled. Contact platform admin.', code: 'ACCOUNT_DISABLED' });
            }

            if (dbUser.tenant && dbUser.tenant.status === 'SUSPENDED') {
                return res.status(403).json({ error: 'Tenant enclave suspended. Access denied.', code: 'TENANT_SUSPENDED' });
            }

            // Trial Enforce: Maturity Check
            if (dbUser.tenant && dbUser.tenant.isTrial) {
                const now = new Date();
                const expiresAt = dbUser.tenant.trialExpiresAt ? new Date(dbUser.tenant.trialExpiresAt) : null;

                if (dbUser.tenant.status === 'TRIAL_EXPIRED' || (expiresAt && now > expiresAt)) {
                    // Auto-update status to TRIAL_EXPIRED if maturity hit
                    if (dbUser.tenant.status !== 'TRIAL_EXPIRED') {
                        await prisma.tenant.update({
                            where: { id: user.tenantId },
                            data: { status: 'TRIAL_EXPIRED' }
                        }).catch(e => console.error("[TrialGuard] Failed to auto-suspend expired trial:", e));
                    }

                    return res.status(403).json({
                        error: 'Sovereign Trial Matured',
                        code: 'TRIAL_EXPIRED',
                        message: 'Your 30-day sovereign trial has concluded. Please upgrade to maintain access to your data.',
                        expiresAt: dbUser.tenant.trialExpiresAt
                    });
                }
            }

            console.log(`[Auth] JWT Verified for user: ${user.email} (Role: ${user.role})`);

            // Deployment Adaptation: On-Premise Enclaves are Single Tenant
            if (!CONFIG.ENABLE_MULTI_TENANCY) {
                user.tenantId = CONFIG.SINGLE_TENANT_ID;
            }

            // Hydrate sensitive context from DB (Department, Attributes, Modules)
            req.user = {
                ...user,
                department: (dbUser as any).department || undefined,
                name: dbUser.name,
                tenant: (dbUser as any).tenant
            };

            requestContext.run({ tenantId: user.tenantId, userId: user.id }, () => {
                next();
            });
        } catch (dbErr: any) {
            console.error(`[Auth] Critical Exception in authenticateToken: ${dbErr.message}`);
            res.status(500).json({ error: 'Authentication internal error', code: 'INTERNAL_ERROR' });
        }
    });
};

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.sendStatus(401);
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`[RBAC] User ${req.user.email} with role ${req.user.role} attempted to access protected route requiring ${allowedRoles.join(', ')}`);
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

export const requireRole = authorizeRole; // Alias for compatibility
