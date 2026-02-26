import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import crypto from 'crypto';
import Stripe from 'stripe';
import { StripeService } from '../services/StripeService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { GoogleAuthService } from '../services/googleAuthService';
import { stripe } from '../stripe';
import { sendInvitationEmail, sendPasswordResetEmail, sendTenantWelcomeEmail } from '../services/EmailService';
import { MfaService } from '../services/mfaService';

const router = express.Router();

async function checkTenantUserLimit(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true }
    });

    if (!tenant) return true; // Fail open if no tenant found (shouldn't happen)

    const pricing = await prisma.pricingConfig.findUnique({
        where: { id: tenant.plan }
    });

    if (!pricing) return true; // Fail open if no pricing config

    const currentUsers = await prisma.user.count({
        where: { tenantId }
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

        // 1. Validate Payment if session ID is provided (Industry Standard)
        if (stripeSessionId) {
            console.log(`[Stripe] Validating session: ${stripeSessionId}`);
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
                subscriptionStatus: subscription?.status || 'active'
            };
            console.log(`[Stripe] Validated session for ${adminEmail}. Status: ${stripeData.subscriptionStatus}`);
        }

        const result = await prisma.$transaction(async (tx) => {
            // Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    plan: plan || 'Starter', // Default to Starter
                    appMode: appMode || 'LAW_FIRM',
                    primaryRegion: region || 'GH_ACC_1',
                    ...stripeData
                }
            });

            // Admin Role
            const role = await tx.role.findFirst({
                where: { name: 'TENANT_ADMIN', isSystem: true, tenantId: null }
            });
            if (!role) throw new Error("Seed roles missing.");

            // Primary Admin User
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

        const permissions = result.user.role?.permissions.map(p => p.id) || [];
        const token = jwt.sign({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role?.name,
            permissions,
            tenantId: result.user.tenantId,
            appMode: result.tenant.appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        // After successful onboarding, sync seat count
        if ((result.tenant as any).stripeSubscriptionId) {
            StripeService.syncSubscriptionQuantity(result.tenant.id).catch(err =>
                console.error(`[Stripe Sync Error] ${err.message}`)
            );
        }

        // Send welcome email (non-blocking)
        sendTenantWelcomeEmail({
            to: adminEmail,
            adminName: `${name} Administrator`,
            tenantName: name,
            tempPassword: adminPassword,
            loginUrl: `${process.env.PLATFORM_URL || 'https://app.nomosdesk.com'}/login`
        }).catch(err => console.error('[Email] Welcome email failed:', err));

        res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role?.name,
                tenantId: result.user.tenantId,
                permissions,
                mode: result.tenant.appMode
            }
        });

    } catch (error: any) {
        console.error(`[Auth] Onboarding Failed: ${error.message}`);

        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            const target = error.meta?.target || ['email'];
            res.status(400).json({
                error: `An account with this ${target.includes('email') ? 'email' : 'name'} already exists.`,
                code: 'CONFLICT'
            });
            return;
        }

        res.status(400).json({ error: error.message || 'Onboarding failed.' });
    }
});

// 2. Resolve Invite Token - PUBLIC
router.post('/resolve-invite', async (req, res) => {
    try {
        const { token } = req.body;
        console.log(`[Invite] Resolving token: ${token}`);

        const invitation = await prisma.invitation.findUnique({
            where: { token, isUsed: false },
            include: { tenant: true }
        });

        if (!invitation) {
            console.log(`[Invite] Token not found or already used: ${token}`);
            res.status(404).json({ error: 'Invalid invitation token' });
            return;
        }

        console.log(`[Invite] Found invitation. Expires at: ${invitation.expiresAt}, Current time: ${new Date()}`);

        if (invitation.expiresAt < new Date()) {
            console.log(`[Invite] Token expired: ${token}`);
            res.status(404).json({ error: 'Invitation has expired' });
            return;
        }

        console.log(`[Invite] Token valid. Tenant: ${invitation.tenant.name}`);
        res.json({
            email: invitation.email,
            roleName: invitation.roleName,
            tenantName: invitation.tenant.name,
            tenantMode: invitation.tenant.appMode
        });
    } catch (error: any) {
        console.error(`[Invite] Error resolving token:`, error);
        res.status(500).json({ error: error.message });
    }
});



// 3. Join Silo (Practitioner Completion) - PUBLIC
router.post('/join-silo', async (req, res) => {
    const { token, name, password } = req.body;

    console.log(`[Join] Attempting to join with token: ${token}`);
    console.log(`[Join] Name: ${name}, Password length: ${password?.length}`);

    try {
        // Enforce Plan Limits before even starting transaction
        // First find the invitation to get the tenant ID
        const preCheckInvite = await prisma.invitation.findUnique({
            where: { token, isUsed: false },
            select: { tenantId: true }
        });

        if (preCheckInvite) {
            await checkTenantUserLimit(preCheckInvite.tenantId);
        }

        const result = await prisma.$transaction(async (tx) => {
            const invitation = await tx.invitation.findUnique({
                where: { token, isUsed: false },
                include: { tenant: true }
            });

            if (!invitation) {
                // Check if invitation exists at all
                const anyInvitation = await tx.invitation.findUnique({
                    where: { token },
                    include: { tenant: true }
                });

                if (!anyInvitation) {
                    console.log(`[Join] ERROR: Invitation not found in database: ${token}`);
                    throw new Error("Invitation not found.");
                } else if (anyInvitation.isUsed) {
                    console.log(`[Join] ERROR: Invitation already used: ${token}`);
                    throw new Error("This invitation has already been used.");
                } else {
                    console.log(`[Join] ERROR: Invitation exists but query failed: ${token}`);
                    throw new Error("Invite resolution failed.");
                }
            }

            console.log(`[Join] Found invitation for ${invitation.email}, tenant: ${invitation.tenant.name}`);

            let role = await tx.role.findFirst({
                where: { name: invitation.roleName, tenantId: invitation.tenantId }
            });

            if (!role) {
                // Fallback to System Role (e.g. CLIENT, GLOBAL_ADMIN)
                console.log(`[Join] Tenant role not found, checking system roles for: ${invitation.roleName}`);
                role = await tx.role.findFirst({
                    where: { name: invitation.roleName, isSystem: true, tenantId: null }
                });
            }

            if (!role) {
                console.log(`[Join] ERROR: Role not found: ${invitation.roleName}`);
                throw new Error("Target role not found.");
            }

            console.log(`[Join] Found role: ${role.name} (ID: ${role.id})`);

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await tx.user.create({
                data: {
                    email: invitation.email,
                    name,
                    passwordHash: hashedPassword,
                    roleId: role.id,
                    roleString: role.name,
                    tenantId: invitation.tenantId,
                    region: invitation.tenant.primaryRegion
                },
                include: { role: { include: { permissions: true } }, tenant: true }
            });

            console.log(`[Join] Created user: ${user.email} (ID: ${user.id})`);

            await tx.invitation.update({
                where: { id: invitation.id },
                data: { isUsed: true }
            });

            console.log(`[Join] Marked invitation as used`);

            return { user, tenant: invitation.tenant };
        });

        // Sync seat count after user joins
        if ((result.tenant as any).stripeSubscriptionId) {
            StripeService.syncSubscriptionQuantity(result.tenant.id).catch(err =>
                console.error(`[Stripe Sync Error] ${err.message}`)
            );
        }

        const permissions = result.user.role?.permissions.map(p => p.id) || [];
        const jwtToken = jwt.sign({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role?.name,
            permissions,
            tenantId: result.user.tenantId,
            appMode: result.tenant.appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        console.log(`[Join] SUCCESS: User joined successfully`);
        res.json({
            token: jwtToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role?.name,
                tenantId: result.user.tenantId,
                permissions,
                mode: result.tenant.appMode
            }
        });

    } catch (error: any) {
        console.error(`[Join] ERROR: ${error.message}`, error);
        res.status(400).json({ error: error.message });
    }
});

// 4. Generate Invitation - PROTECTED
router.post('/invite', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { email, roleName } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const tenantId = req.user.tenantId;

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        // Check limits before creating an invite
        // Note: This is an optimistic check. The real check happens at join, but we shouldn't allow invites if full.
        await checkTenantUserLimit(tenantId);

        const token = `SOV-INV-${crypto.randomUUID().split('-')[0]!.toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        console.log(`[Invite] Creating invitation for ${email} in tenant ${tenantId}`);
        console.log(`[Invite] Token: ${token}, Expires: ${expiresAt}`);

        const invitation = await prisma.invitation.create({
            data: {
                token,
                email,
                roleName: roleName || 'INTERNAL_COUNSEL',
                tenantId,
                expiresAt
            }
        });

        console.log(`[Invite] Invitation created successfully. ID: ${invitation.id}`);
        res.json({ token, expiresAt: invitation.expiresAt });
    } catch (error: any) {
        console.error(`[Invite] Error creating invitation:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 4.5 Dispatch Invitation - PROTECTED
router.post('/dispatch-invite', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { token, email, roleName, tenantName } = req.body;
        const inviterName = req.user?.email || 'Your Administrator';

        console.log(`[Notification] Dispatching Sovereign Invitation for ${email} with token ${token}`);

        // Fire Resend email (non-blocking)
        sendInvitationEmail({
            to: email,
            inviterName,
            tenantName: tenantName || 'your organisation',
            roleName: roleName || 'Team Member',
            inviteToken: token
        }).catch(err => console.error('[Email] Invitation dispatch failed:', err));

        res.json({ success: true, message: 'Invitation dispatched successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Register - Standard
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, roleName, region, tenantId } = req.body;

        if (tenantId) {
            await checkTenantUserLimit(tenantId);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = await prisma.role.findFirst({
            where: { name: roleName || 'INTERNAL_COUNSEL', tenantId: tenantId || null }
        });

        if (!role) {
            res.status(400).json({ error: 'Invalid Role' });
            return;
        }

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                roleId: role.id,
                roleString: role.name,
                region: region || 'GH_ACC_1',
                tenantId: tenantId || null
            },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        const permissions = user.role?.permissions.map((p: any) => p.id) || [];
        const appMode = user.tenant?.appMode || 'LAW_FIRM';

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role?.name,
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });
    } catch (error: any) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log(`[AuthFlow] Attempting login for: ${req.body?.email}`);
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        if (!user) {
            console.warn(`[AuthFlow] Login Failed: User not found for ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.passwordHash) {
            console.warn(`[AuthFlow] Login Failed: No password hash for user ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.warn(`[AuthFlow] Login Failed: Password mismatch for ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[AuthFlow] Login Success for user: ${email} (Role: ${user.role?.name || 'UNKNOWN'})`);

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        // MFA Integration - Two-Step Flow
        if (user.mfaEnabled) {
            console.log(`[AuthFlow] MFA Required for user: ${email}`);
            const mfaToken = jwt.sign({
                id: user.id,
                purpose: 'mfa_verification'
            }, JWT_SECRET, { expiresIn: '10m' });

            return res.json({
                mfaRequired: true,
                mfaToken
            });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any)?.role?.name || 'UNKNOWN',
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// 5. Google Login - PUBLIC
router.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Missing ID Token' });

        const payload = await GoogleAuthService.verifyToken(idToken);
        if (!payload || !payload.email) {
            return res.status(401).json({ error: 'Invalid Google Token' });
        }

        const email = payload.email;

        // 1. Find or Setup User
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        if (!user) {
            // Check if there is an invitation for this email
            const invitation = await prisma.invitation.findFirst({
                where: { email, isUsed: false },
                include: { tenant: true }
            });

            if (invitation) {
                // Provision user based on invitation
                const role = await prisma.role.findFirst({
                    where: { name: invitation.roleName, tenantId: invitation.tenantId }
                });

                if (role) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: payload.name || email.split('@')[0],
                            passwordHash: 'EXTERNAL_OIDC', // Flag for no local password
                            roleId: role.id,
                            roleString: role.name,
                            tenantId: invitation.tenantId,
                            region: invitation.tenant.primaryRegion,
                            provider: 'GOOGLE',
                            providerId: payload.sub
                        },
                        include: { role: { include: { permissions: true } }, tenant: true }
                    });

                    await prisma.invitation.update({
                        where: { id: invitation.id },
                        data: { isUsed: true }
                    });
                }
            }
        }

        if (!user) {
            return res.status(403).json({
                error: 'Account not found. Please contact your administrator or seek an invitation.',
                unregistered: true,
                email
            });
        }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        // MFA Integration - Two-Step Flow for Google (Optional policy)
        if (user.mfaEnabled) {
            console.log(`[AuthFlow] Google Login requires second factor for: ${email}`);
            const mfaToken = jwt.sign({
                id: user.id,
                purpose: 'mfa_verification'
            }, JWT_SECRET, { expiresIn: '10m' });

            return res.json({
                mfaRequired: true,
                mfaToken
            });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any)?.role?.name || 'UNKNOWN',
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });

    } catch (error: any) {
        console.error('[GoogleAuth] API Error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get Me
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) { res.sendStatus(401); return; }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        if (!user) { res.sendStatus(404); return; }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: (user as any).role?.name,
            tenantId: user.tenantId,
            permissions,
            mode: appMode
        });

    } catch (e) {
        res.sendStatus(403);
    }
});

// 6. Get Sovereign Pin - SECURE
router.get('/pin', authenticateToken, (req, res) => {
    console.log(`[Auth] PIN requested by ${req.user?.email}`);
    res.json({ pin: process.env.SOVEREIGN_PIN || "" });
});

// 7. Get Pending Invites - PROTECTED
router.get('/invites', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        if (!isGlobalAdmin && !req.user?.tenantId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const invites = await prisma.invitation.findMany({
            where: {
                ...(isGlobalAdmin ? {} : { tenantId: req.user!.tenantId }),
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(invites);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Delete Invitation - PROTECTED
router.delete('/invites/:id', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const inviteId = req.params.id;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        const tenantId = req.user?.tenantId;

        if (!isGlobalAdmin && !tenantId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const invite = await prisma.invitation.findFirst({
            where: isGlobalAdmin ? { id: inviteId } : { id: inviteId, tenantId: req.user!.tenantId }
        });

        if (!invite) {
            res.status(404).json({ error: 'Invitation not found' });
            return;
        }

        await prisma.invitation.delete({
            where: { id: inviteId }
        });

        res.json({ success: true, message: 'Invitation revoked successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Forgot Password - PUBLIC
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Return success anyway to avoid email enumeration
            res.json({ success: true, message: 'If an account exists, a reset link has been generated.' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpires: expires
            }
        });

        // Send real password reset email via Resend
        sendPasswordResetEmail({ to: email, resetToken: token })
            .catch(err => console.error('[Email] Password reset email failed:', err));

        res.json({ success: true, message: 'Instructions sent to email.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Verify Reset Token - PUBLIC
router.post('/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        res.json({ success: true, email: user.email });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 11. Reset Password - PUBLIC
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── MFA Endpoints ──────────────────────────────────────────────────────────

// 1. Setup MFA (Authenticated)
router.post('/mfa/setup', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const secret = MfaService.generateSecret();
        const qrCode = await MfaService.generateQRCode(user.email, secret);

        // Store secret temporarily (or just return it for the user to verify in next step)
        // We'll store it permanently only after first successful verification
        res.json({ secret, qrCode });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Enable MFA (Authenticated)
router.post('/mfa/enable', authenticateToken, async (req: any, res) => {
    try {
        const { secret, token } = req.body;
        const userId = req.user.id;

        const isValid = MfaService.verifyToken(token, secret);
        if (!isValid) return res.status(400).json({ error: 'Invalid verification code' });

        // Generate backup codes
        const { plaintext, hashed } = MfaService.generateBackupCodes();

        await prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: true,
                mfaSecret: secret,
                mfaBackupCodes: hashed as any
            }
        });

        res.json({ success: true, backupCodes: plaintext });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Verify MFA (Second Factor during Login)
router.post('/mfa/verify', async (req, res) => {
    try {
        const { mfaToken, code } = req.body;

        // 1. Verify mfaToken
        const decoded = jwt.verify(mfaToken, JWT_SECRET) as any;
        if (decoded.purpose !== 'mfa_verification') {
            return res.status(401).json({ error: 'Invalid MFA session' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: { role: { include: { permissions: true } }, tenant: true }
        });

        if (!user || !user.mfaSecret) {
            return res.status(401).json({ error: 'MFA not configured or user not found' });
        }

        // 2. Verify Code (Check TOTP or Backup Code)
        let isValid = MfaService.verifyToken(code, user.mfaSecret);
        let updatedBackupCodes: string[] | null = null;

        if (!isValid && Array.isArray(user.mfaBackupCodes)) {
            const result = MfaService.verifyBackupCode(code, user.mfaBackupCodes as string[]);
            if (result.isValid) {
                isValid = true;
                updatedBackupCodes = result.updatedCodes;
            }
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid code or recovery key' });
        }

        // 3. Update backup codes if one was used
        if (updatedBackupCodes) {
            await prisma.user.update({
                where: { id: user.id },
                data: { mfaBackupCodes: updatedBackupCodes as any }
            });
        }

        // 4. Issue full JWT
        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any)?.role?.name || 'UNKNOWN',
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });
    } catch (error: any) {
        res.status(401).json({ error: 'MFA verification timed out or invalid' });
    }
});

export default router;
