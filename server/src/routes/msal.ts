import express from 'express';
import * as msal from '@azure/msal-node';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';

const router = express.Router();

const msalConfig = {
    auth: {
        clientId: process.env.MSAL_CLIENT_ID || 'dummy-client-id',
        authority: process.env.MSAL_AUTHORITY || 'https://login.microsoftonline.com/common',
        clientSecret: process.env.MSAL_CLIENT_SECRET || 'dummy-secret',
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

const REDIRECT_URI = process.env.NODE_ENV === 'production' 
    ? 'https://app.nomosdesk.com/api/auth/msal/callback' 
    : 'http://localhost:3001/api/auth/msal/callback';
    
const REDIRECT_SUCCESS = process.env.NODE_ENV === 'production' 
    ? 'https://app.nomosdesk.com/' 
    : 'http://localhost:5173/';

router.get('/init', async (req, res) => {
    const authCodeUrlParameters = {
        scopes: ["user.read", "profile", "email"],
        redirectUri: REDIRECT_URI,
    };

    try {
        const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(response);
    } catch (error) {
        console.error('[MSAL] getAuthCodeUrl Error:', error);
        res.status(500).send('Error initializing Microsoft Authentication.');
    }
});

router.get('/callback', async (req, res) => {
    const tokenRequest = {
        code: req.query.code as string,
        scopes: ["user.read", "profile", "email"],
        redirectUri: REDIRECT_URI,
    };

    try {
        const response = await cca.acquireTokenByCode(tokenRequest);
        
        if (!response.account || !response.account.username) {
             console.error("[MSAL] Account missing from token response.");
             return res.redirect(`${REDIRECT_SUCCESS}?error=msal_auth_failed`);
        }

        const email = response.account.username.toLowerCase();
        const name = response.account.name || 'Microsoft User';

        // 1. Resolve user in DB
        const user: any = await prisma.user.findUnique({
             where: { email },
             include: { role: { include: { permissions: true } }, tenant: true }
        });

        if (!user) {
             console.warn(`[MSAL] User ${email} attempted login but doesn't exist.`);
             return res.redirect(`${REDIRECT_SUCCESS}?error=unregistered_account`);
        }

        // 2. Issue JWT Session
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

        // 3. Construct a client-side handoff query param string so the frontend detects the session (App.tsx / useAuth handles native cookie)
        // By just redirecting to base URL, `useAuth` hook will natively hydrate session parsing the `/me` endpoint!
        res.redirect(REDIRECT_SUCCESS);

    } catch (error) {
        console.error('[MSAL] Callback Acquisition Error:', error);
        res.redirect(`${REDIRECT_SUCCESS}?error=msal_auth_failed`);
    }
});

export default router;
