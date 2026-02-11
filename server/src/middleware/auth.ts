import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { requestContext } from '../db';
import { CONFIG } from '../config';

import { AuthUser } from '../types';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401); // Unauthorized
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.error(`[Auth] JWT Verification failed: ${err.message}`);
            return res.status(403).json({
                error: 'Invalid session token',
                code: 'FORBIDDEN',
                reason: err.message === 'jwt expired' ? 'expired' : 'invalid'
            });
        }

        console.log(`[Auth] JWT Verified for user: ${user.email} (Role: ${user.role})`);

        // Deployment Adaptation: On-Premise Enclaves are Single Tenant
        if (!CONFIG.ENABLE_MULTI_TENANCY) {
            user.tenantId = CONFIG.SINGLE_TENANT_ID;
        }

        req.user = user;

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
