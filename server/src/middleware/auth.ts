import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { prisma, requestContext } from '../db';
import { CONFIG } from '../config';

import { AuthUser } from '../types';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`[Auth-Diag] Request to ${req.originalUrl || req.url} | Header: ${authHeader ? 'Y' : 'N'} | Token: ${token ? (token === 'undefined' ? 'UNDEFINED_STR' : 'EXISTS') : 'MISSING'}`);

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

        // Check User & Tenant Status
        const dbUser = await requestContext.run({ tenantId: user.tenantId, userId: user.id }, () =>
            prisma.user.findUnique({
                where: { id: user.id },
                include: { tenant: { select: { status: true } } }
            })
        );

        if (!dbUser || !dbUser.isActive) {
            return res.status(403).json({ error: 'Account disabled. Contact platform admin.', code: 'ACCOUNT_DISABLED' });
        }

        if (dbUser.tenant && dbUser.tenant.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Tenant enclave suspended. Access denied.', code: 'TENANT_SUSPENDED' });
        }

        console.log(`[Auth] JWT Verified for user: ${user.email} (Role: ${user.role})`);

        // Deployment Adaptation: On-Premise Enclaves are Single Tenant
        if (!CONFIG.ENABLE_MULTI_TENANCY) {
            user.tenantId = CONFIG.SINGLE_TENANT_ID;
        }

        // Hydrate sensitive context from DB (Department, Attributes)
        req.user = {
            ...user,
            department: dbUser.department || undefined,
            name: dbUser.name
        };

        requestContext.run({ tenantId: user.tenantId, userId: user.id }, () => {
            next();
        });
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
