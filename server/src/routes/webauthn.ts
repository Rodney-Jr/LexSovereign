import express from 'express';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import crypto from 'crypto';

const router = express.Router();
const rpName = 'NomosDesk Sovereign Identity';
const rpID = process.env.NODE_ENV === 'production' ? 'app.nomosdesk.com' : 'localhost';
const origin = process.env.PLATFORM_URL || `http://${rpID}:5173`;

// In-memory store for challenges (In production, use Redis or a DB table)
const userChallengeStore: Record<string, string> = {};

// 1. Generate Registration Options (Enroll a new Passkey)
router.post('/register/generate', async (req, res) => {
    // Note: In a real flow, the user must be authenticated (e.g. via emailOTP or existing session) to enroll a passkey.
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email required' });

    let user: any = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({ error: 'User not found. Must have a base identity to enroll.' });
    }

    const passkeys: any[] = await prisma.passkeyCredential.findMany({ where: { userId: user.id } });

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: crypto.randomBytes(32), // High entropy string
        userName: user.email,
        // Don't prompt users for their authenticator if they've already registered it
        excludeCredentials: passkeys.map(passkey => ({
            id: passkey.credentialID,
            type: 'public-key',
            transports: passkey.transports ? (passkey.transports as any) : undefined
        })),
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    userChallengeStore[user.id] = options.challenge;

    return res.json(options);
});

// 2. Verify Registration
router.post('/register/verify', async (req, res) => {
    const { email, body: credential } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const expectedChallenge = userChallengeStore[user.id];
    if (!expectedChallenge) return res.status(400).json({ error: 'No active challenge' });

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
    } catch (error: any) {
        console.error('[WebAuthn] Registration Verify Error:', error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;
    
    if (verified && registrationInfo) {
        const info = (registrationInfo as any);
        const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = info;
        
        await prisma.passkeyCredential.create({
            data: {
                userId: user.id,
                webauthnUserId: user.id,
                credentialID: (credentialID as any),
                publicKey: (credentialPublicKey as any),
                counter: BigInt(counter),
                deviceType: credentialDeviceType,
                backedUp: credentialBackedUp,
                transports: credential.response.transports || []
            }
        });

        delete userChallengeStore[user.id];
        return res.json({ verified: true });
    }

    return res.status(400).json({ error: 'Verification failed' });
});

// 3. Generate Authentication Options (Login)
router.get('/login/generate', async (req, res) => {
    const { email } = req.query;

    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email: email as string } });
    if (!user) return res.status(404).json({ error: 'Identity not found' });

    const passkeys: any[] = await prisma.passkeyCredential.findMany({ where: { userId: user.id } });

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: passkeys.map(passkey => ({
            id: passkey.credentialID,
            type: 'public-key',
            transports: passkey.transports ? (passkey.transports as any) : undefined
        })),
        userVerification: 'preferred',
    });

    userChallengeStore[user.id] = options.challenge;

    return res.json(options);
});

// 4. Verify Authentication (Finalize Login)
router.post('/login/verify', async (req, res) => {
    const { email, body: credential } = req.body;

    const user: any = await prisma.user.findUnique({ 
        where: { email },
        include: { role: { include: { permissions: true } }, tenant: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const expectedChallenge = userChallengeStore[user.id];
    if (!expectedChallenge) return res.status(400).json({ error: 'No active challenge' });

    const passkey = await prisma.passkeyCredential.findFirst({
        where: { 
            userId: user.id,
            credentialID: Buffer.from(credential.id, 'base64url') // Find specific passkey used
        }
    });

    if (!passkey) return res.status(400).json({ error: 'Passkey not recognized' });

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: passkey.credentialID.toString('base64url'),
                publicKey: new Uint8Array(passkey.publicKey),
                counter: Number(passkey.counter),
            },
        });
    } catch (error: any) {
        console.error('[WebAuthn] Auth Verify Error:', error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        // Update counter to prevent replay attacks
        await prisma.passkeyCredential.update({
            where: { id: passkey.id },
            data: { 
                counter: BigInt(authenticationInfo.newCounter),
                lastUsedAt: new Date()
            }
        });

        delete userChallengeStore[user.id];

        // Issue JWT Session
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
            verified: true,
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
    }

    return res.status(400).json({ error: 'Login verification failed' });
});

export default router;
