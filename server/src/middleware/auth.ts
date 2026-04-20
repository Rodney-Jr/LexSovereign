import { Request, Response, NextFunction } from 'express';
import { prisma, requestContext } from '../db';
import { CONFIG } from '../config';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { AuthUser } from '../types';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    try {
        // Strict Native JWT Verification
        const decodedPayload: any = jwt.verify(token, JWT_SECRET);
        
        req.user = {
            id: decodedPayload.id,
            email: decodedPayload.email,
            role: decodedPayload.role,
            tenantId: decodedPayload.tenantId,
            name: decodedPayload.name || 'User Session',
            permissions: decodedPayload.permissions || [],
            isImpersonating: !!decodedPayload.isImpersonating
        };

        // Complete Universal Fallback for GLOBAL_ADMIN Sessions
        // This instantly prevents the cluster cascade of 403 Tenant Context missing errors
        // on specialized sub-modules (chatbot, ui-visibility, branding) without requiring route-by-route null checks.
        if (req.user.role === 'GLOBAL_ADMIN' && !req.user.tenantId) {
            try {
                const defaultTenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
                if (defaultTenant) {
                    req.user.tenantId = defaultTenant.id;
                    console.log(`[Auth-Fallback] Hydrated tenantId context for GLOBAL_ADMIN from master pool:`, defaultTenant.id);
                }
            } catch (err) {
                console.warn('[Auth-Fallback] Error hydrating global admin tenant context:', err);
            }
        }

        if (req.user && !req.user.isImpersonating) {
             const userStatus: any = await prisma.user.findUnique({ 
                where: { id: req.user.id },
                select: { 
                    isActive: true, 
                    tenant: { 
                        select: { 
                            status: true, 
                            isTrial: true, 
                            trialExpiresAt: true,
                            subscriptionStatus: true
                        } 
                    } 
                }
             });

             if (userStatus && !userStatus.isActive) return res.status(403).json({ error: 'Account disabled' });
             
             if (userStatus?.tenant) {
                 const t = userStatus.tenant;
                 if (t.status === 'SUSPENDED') return res.status(403).json({ error: 'Tenant suspended' });
                 
                 // Trial Expiry Check
                 if (t.isTrial && t.trialExpiresAt && new Date(t.trialExpiresAt) < new Date()) {
                     // If it's a trial and it's expired, and hasn't been upgraded to ACTIVE/PAID
                     if (t.subscriptionStatus !== 'active' && t.status !== 'ACTIVE_PAID') {
                         return res.status(402).json({ 
                             error: 'Trial expired', 
                             code: 'TRIAL_EXPIRED',
                             message: 'Your 30-day sovereign trial has concluded. Please upgrade to maintain enclave access.' 
                         });
                     }
                 }
             }
        }

        return requestContext.run({ tenantId: req.user.tenantId || undefined, userId: req.user.id }, () => {
            return next();
        });

    } catch (error: any) {
        console.error(`[Auth] Authentication failed: ${error.message}`);
        res.status(401).json({ error: 'Invalid or expired session', reason: error.message });
        return;
    }
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

export const requirePermission = (action: string, resource: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) {
            res.sendStatus(401);
            return;
        }

        // Diagnostic Logging
        console.log(`[RBAC-Check] User: ${user.id}, Role: ${user.role}, Checking Permission: ${action} on ${resource}`);

        // 1. GLOBAL_ADMIN Bypass (SUPER_ADMIN equivalent)
        if (user.role === 'GLOBAL_ADMIN') {
            return next();
        }

        // 2. TENANT_ADMIN Fallback logic for settings
        const isTenantAdmin = user.role === 'TENANT_ADMIN';
        const isSettingsPerm = resource === 'TENANT_SETTINGS' || resource === 'TENANT' || resource === 'USER' || resource === 'INVITATION';

        if (isTenantAdmin && isSettingsPerm) {
            return next();
        }

        // 3. Granular Permission Check
        const hasPermission = user.permissions?.some((p: any) => p.action === action && p.resource === resource);
        if (!hasPermission) {
            console.warn(`[RBAC] Access Denied: User ${user.email} (Role: ${user.role}) lacks required permission: ${action} on ${resource}`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // 4. Optional Policy Engine Hook (ABAC prep)
        /*
        if (policyEngine.evaluate(user, resource, action, req) === 'DENY') {
            console.warn(`[ABAC] Policy Restriction for ${user.email} on ${resource}`);
            return res.status(403).json({ error: 'Policy restriction' });
        }
        */

        return next();
    };
};
