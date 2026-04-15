import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import Stripe from 'stripe';
import { stripe } from '../stripe';
import { StripeService } from '../services/StripeService';
import { sendTenantWelcomeEmail, sendInvitationEmail } from '../services/EmailService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const router = express.Router();

// 0. Email/Password Login
// Verifies credentials via Bcrypt Hash, issues a signed JWT as an HttpOnly cookie.
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // Step 1: Look up the user in our database
        const dbUser: any = await (prisma as any).user.findUnique({
            where: { email },
            include: {
                role: { include: { permissions: true } },
                tenant: { select: { id: true, status: true, appMode: true, enabledModules: true } }
            }
        });

        if (!dbUser) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Step 2: Verify password natively
        if (!dbUser.passwordHash) {
            return res.status(401).json({ error: 'This account relies exclusively on Passkeys or SSO. Native password login is disabled.' });
        }

        const isValid = await bcrypt.compare(password, dbUser.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Resiliency: fallback lookup by email if UID not stored yet
        let resolvedUser = dbUser;

        if (!resolvedUser) {
            return res.status(401).json({ error: 'User not found in platform database.' });
        }

        // Step 4: Status checks
        if (!resolvedUser.isActive) {
            return res.status(403).json({ error: 'This account has been disabled.' });
        }
        if (resolvedUser.tenant?.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Tenant account is suspended.' });
        }

        // Force Password Change Required
        if ((resolvedUser.attributes as any)?.forcePasswordChange) {
             const passwordChangeToken = jwt.sign(
                 { id: resolvedUser.id, type: 'PASSWORD_CHANGE' },
                 JWT_SECRET,
                 { expiresIn: '15m' }
             );
             return res.json({ forcePasswordChange: true, changeToken: passwordChangeToken });
        }

        // --- NEW: MFA CHALLENGE ---
        if (resolvedUser.mfaEnabled) {
             const mfaChallengeToken = jwt.sign(
                 { id: resolvedUser.id, type: 'MFA_CHALLENGE' },
                 JWT_SECRET,
                 { expiresIn: '5m' }
             );
             return res.json({ mfaRequired: true, mfaToken: mfaChallengeToken });
        }

        // Step 5: Issue a signed JWT (the legacy path in authenticateToken supports this)
        const permissions = resolvedUser.role?.permissions || [];
        const sessionToken = jwt.sign(
            {
                id: resolvedUser.id,
                email: resolvedUser.email,
                role: resolvedUser.roleString,
                tenantId: resolvedUser.tenantId,
                name: resolvedUser.name,
                permissions: permissions.map((p: any) => p.id),
                isImpersonating: false
            },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        // Step 6: Set token as HttpOnly cookie for subsequent API calls
        res.cookie('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000 // 12 hours
        });

        console.log(`[Login] Authenticated: ${resolvedUser.email} (${resolvedUser.roleString})`);

        // Audit Success
        await AuditService.log(
            'SIGN_IN_SUCCESS',
            resolvedUser.id,
            resolvedUser.tenantId,
            null,
            { method: 'PASSWORD', ip: req.ip }
        );

        // Step 7: Return session payload to client
        return res.json({
            token: sessionToken,
            user: {
                id: resolvedUser.id,
                email: resolvedUser.email,
                name: resolvedUser.name,
                role: resolvedUser.roleString,
                tenantId: resolvedUser.tenantId,
                permissions,
                mode: resolvedUser.tenant?.appMode || 'LAW_FIRM'
            }
        });

    } catch (error: any) {
        console.error('[Login] Critical error:', error.message);
        
        // Audit Failure if email was provided
        if (req.body.email) {
            const user = await prisma.user.findUnique({ where: { email: req.body.email } });
            await AuditService.log(
                'SIGN_IN_FAILURE',
                user?.id || null,
                user?.tenantId || null,
                null,
                { email: req.body.email, error: error.message, ip: req.ip }
            );
        }

        return res.status(500).json({ error: 'An internal authentication error occurred.' });
    }
});

// 0.5 Change Password (From forced setup)
router.post('/change-password', async (req, res) => {
    const { changeToken, newPassword } = req.body;
    if (!changeToken || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Valid token and strong new password are required.' });
    }

    try {
        let decoded: any;
        try {
            decoded = jwt.verify(changeToken, JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ error: 'Token expired or invalid.' });
        }

        if (decoded.type !== 'PASSWORD_CHANGE') {
            return res.status(401).json({ error: 'Invalid token type.' });
        }

        const dbUser: any = await (prisma as any).user.findUnique({
            where: { id: decoded.id },
            include: { role: { include: { permissions: true } }, tenant: true }
        });

        if (!dbUser) return res.status(404).json({ error: 'User not found.' });

        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Remove forcePasswordChange from attributes
        const attributes = dbUser.attributes || {};
        delete attributes.forcePasswordChange;

        await prisma.user.update({
            where: { id: dbUser.id },
            data: { passwordHash, attributes }
        });

        // Audit Success
        await AuditService.log('PASSWORD_CHANGED', dbUser.id, dbUser.tenantId, null, { method: 'FORCED_SETUP', ip: req.ip });

        res.json({ success: true, message: 'Password updated successfully. Please log in with your new password.' });

    } catch (error: any) {
        console.error('[Change Password] Error:', error.message);
        res.status(500).json({ error: 'Internal server error during password reset.' });
    }
});


async function checkTenantUserLimit(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true }
    });

    if (!tenant) return true;

    const pricing = await prisma.pricingConfig.findUnique({
        where: { id: tenant.plan }
    });

    if (!pricing) return true;

    const currentUsers = await prisma.user.count({
        where: { 
            tenantId,
            roleString: {
                notIn: ['CLIENT', 'EXTERNAL_COUNSEL']
            }
        }
    });

    if (currentUsers >= (pricing as any).maxUsers) {
        throw new Error(`Plan limit reached. Your ${tenant.plan} plan allows up to ${(pricing as any).maxUsers} users.`);
    }

    return true;
}

// 1. Atomic Onboard (New Silo + Admin) - PUBLIC
router.post('/onboard-silo', async (req, res) => {
    const { name, plan, appMode, region, adminEmail, adminPassword, stripeSessionId } = req.body;

    try {
        let stripeData: any = {};

        if (stripeSessionId) {
            const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
                expand: ['subscription']
            });

            if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
                throw new Error("Payment session has not been completed.");
            }

            const subscription = session.subscription as Stripe.Subscription;
            stripeData = {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: subscription?.id,
                subscriptionStatus: subscription?.status || 'active',
                isTrial: false,
                status: 'ACTIVE'
            };
        } else {
            // No payment session - Start 30-day trial
            const trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
            stripeData = {
                isTrial: true,
                trialExpiresAt,
                subscriptionStatus: 'TRIALING',
                status: 'ACTIVE'
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    plan: plan || 'Starter',
                    appMode: appMode || 'LAW_FIRM',
                    primaryRegion: region || 'GH_ACC_1',
                    ...stripeData
                }
            });

            const role = await tx.role.findFirst({
                where: { name: 'TENANT_ADMIN', isSystem: true, tenantId: null }
            });
            if (!role) throw new Error("Seed roles missing.");

            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const user = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    name: `${name} Administrator`,
                    roleId: role.id,
                    roleString: 'TENANT_ADMIN',
                    tenantId: tenant.id,
                    region: region || 'GH_ACC_1'
                },
                include: { role: { include: { permissions: true } }, tenant: true }
            });

            return { user, tenant };
        });

        if ((result.tenant as any).stripeSubscriptionId) {
            StripeService.syncSubscriptionQuantity(result.tenant.id).catch(err =>
                console.error(`[Stripe Sync Error] ${err.message}`)
            );
        }

        sendTenantWelcomeEmail({
            to: adminEmail,
            adminName: `${name} Administrator`,
            tenantName: name,
            tempPassword: adminPassword,
            loginUrl: `${process.env.PLATFORM_URL || 'https://app.nomosdesk.com'}/login`
        }).catch(err => console.error('[Email] Welcome email failed:', err));

        return res.status(201).json({
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: (result.user as any).role?.name,
                tenantId: result.user.tenantId,
                mode: (result.tenant as any).appMode || 'LAW_FIRM'
            }
        });

    } catch (error: any) {
        console.error('[Onboard] Critical Failure:', error.message);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Account or tenant already exists.', code: 'CONFLICT' });
        }
        return res.status(400).json({ error: error.message || 'Onboarding failed.' });
    }
});

// 2. Resolve Invite Token - PUBLIC
router.post('/resolve-invite', async (req, res) => {
    try {
        const { token } = req.body;
        const invitation = await prisma.invitation.findUnique({
            where: { token, isUsed: false },
            include: { tenant: true }
        });

        if (!invitation || invitation.expiresAt < new Date()) {
            return res.status(404).json({ error: 'Invalid or expired invitation token' });
        }

        return res.json({
            email: invitation.email,
            name: (invitation as any).name,
            roleName: invitation.roleName,
            tenantName: invitation.tenant.name,
            tenantMode: invitation.tenant.appMode
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. Join Silo (Practitioner Completion) - PUBLIC
router.post('/join-silo', async (req, res) => {
    const { token, name, password } = req.body;

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token, isUsed: false },
            include: { tenant: true }
        });

        if (!invitation) throw new Error("Invitation not found or already used.");

        await checkTenantUserLimit(invitation.tenantId as string);

        const result = await prisma.$transaction(async (tx) => {
            let role = await tx.role.findFirst({
                where: { name: invitation.roleName, tenantId: invitation.tenantId as string }
            });

            if (!role) {
                role = await tx.role.findFirst({
                    where: { name: invitation.roleName, isSystem: true, tenantId: null }
                });
            }

            if (!role) throw new Error("Target role not found.");

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await tx.user.create({
                data: {
                    email: invitation.email,
                    passwordHash: hashedPassword,
                    name,
                    roleId: role.id,
                    roleString: role.name,
                    tenantId: invitation.tenantId as string,
                    region: invitation.tenant.primaryRegion
                },
                include: { role: { include: { permissions: true } }, tenant: true }
            });

            await tx.invitation.update({
                where: { id: invitation.id },
                data: { isUsed: true }
            });

            return { user, tenant: invitation.tenant };
        });

        return res.json({
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: (result.user as any).role?.name,
                tenantId: result.user.tenantId,
                mode: result.tenant.appMode
            }
        });

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
});

// 4. Generate Invitation - PROTECTED
router.post('/invite', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req: any, res) => {
    try {
        const { email, roleName, name } = req.body;
        const tenantId = req.user.tenantId;

        await checkTenantUserLimit(tenantId);

        const token = `SOV-INV-${crypto.randomUUID().split('-')[0]!.toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await (prisma.invitation as any).create({
            data: {
                token,
                email,
                name,
                roleName: roleName || 'INTERNAL_COUNSEL',
                tenantId,
                expiresAt
            }
        });

        return res.json({ token, expiresAt });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// Session Hydration
router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Session context missing' });

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                permissions: user.permissions.map((p: any) => p.id) || [],
                mode: user.tenant?.appMode || 'LAW_FIRM'
            }
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/pin', authenticateToken, (req, res) => {
    return res.json({ pin: process.env.SOVEREIGN_PIN || "" });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.json({ success: true });
});

router.post('/studio-token', authenticateToken, async (req: any, res) => {
    try {
        const { docId } = req.body;
        const user = req.user;
        let contextTenantId = user.tenantId;

        // If user is a Global Admin without a tenantId, resolve the tenant context from the document being edited
        if (!contextTenantId && user.role === 'GLOBAL_ADMIN' && docId) {
             const doc = await prisma.document.findUnique({ where: { id: docId } });
             if (doc) {
                 contextTenantId = doc.tenantId;
                 console.log(`[Studio-Link] Inheriting tenant scope: ${contextTenantId} for Global Admin: ${user.email}`);
             }
        }

        console.log(`[Studio-Link] Generating handoff token for: ${user.email} (Tenant: ${contextTenantId})`);
        
        const studioToken = jwt.sign(
            { 
               id: user.id, 
               tenantId: contextTenantId, 
               role: user.role, 
               email: user.email, 
               name: user.name,
               permissions: user.permissions?.map((p: any) => p.id) || [],
               type: 'STUDIO_HANDOFF'
            },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        return res.json({ token: studioToken });
    } catch (e: any) {
        console.error('[Studio-Link] Token generation failed:', e.message);
        return res.status(500).json({ error: e.message });
    }
});

// --- NEW: MFA SYSTEM ROUTES ---
import { MfaService } from '../services/mfaService';

// 5. MFA Setup Initiation (Request Secret/QR)
router.get('/mfa/setup', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const secret = MfaService.generateSecret();
        const qrCode = await MfaService.generateQRCode(req.user.email, secret);
        
        // Cache secret temporarily or tell client to provide it back for /enable step
        // For simplicity, we return it to the client for the confirmation screen
        return res.json({ secret, qrCode });
    } catch (e: any) {
        return res.status(500).json({ error: 'MFA setup initialization failed.' });
    }
});

// 6. MFA Enablement (Verification & Activation)
router.post('/mfa/enable', authenticateToken, async (req: any, res) => {
    const { secret, code } = req.body;
    try {
        const isValid = MfaService.verifyToken(code, secret);
        if (!isValid) return res.status(400).json({ error: 'Invalid verification code.' });

        // Generate backup codes
        const { plaintext, hashed } = MfaService.generateBackupCodes();

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                mfaEnabled: true,
                attributes: {
                    ...(req.user.attributes as any),
                    mfaSecret: secret // Encrypt in production!
                },
                mfaBackupCodes: hashed
            }
        });

        await AuditService.log(
            'MFA_ACTIVATED',
            req.user.id,
            req.user.tenantId,
            null,
            { method: 'TOTP', ip: req.ip }
        );

        return res.json({ success: true, backupCodes: plaintext });
    } catch (e: any) {
        return res.status(500).json({ error: 'MFA activation failed.' });
    }
});

// 7. MFA Verification (Login Flow Fulfillment)
router.post('/mfa/verify', async (req, res) => {
    const { code, mfaToken } = req.body;
    try {
        const payload: any = jwt.verify(mfaToken, JWT_SECRET);
        if (payload.type !== 'MFA_CHALLENGE') throw new Error('Invalid token type');

        const user: any = await prisma.user.findUnique({
            where: { id: payload.id },
            include: { 
                role: { include: { permissions: true } },
                tenant: { select: { id: true, status: true, appMode: true } }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const mfaSecret = (user.attributes as any)?.mfaSecret;
        if (!mfaSecret) return res.status(400).json({ error: 'MFA not configured correctly' });

        const isValid = MfaService.verifyToken(code, mfaSecret);
        if (!isValid) return res.status(401).json({ error: 'Invalid MFA code' });

        // Phase Finalized: Issue full session JWT
        const permissions = user.role?.permissions || [];
        const sessionToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.roleString,
                tenantId: user.tenantId,
                name: user.name,
                permissions: permissions.map((p: any) => p.id),
                isImpersonating: false
            },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.json({
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.roleString,
                tenantId: user.tenantId,
                permissions,
                mode: user.tenant?.appMode || 'LAW_FIRM'
            }
        });

    } catch (e: any) {
        return res.status(401).json({ error: 'Verification failed' });
    }
});

export default router;
