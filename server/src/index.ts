import dotenv from 'dotenv';
import path from 'path';
// Load environment variables immediately
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
console.log("[VERSION CHECK] v5 - AUTH DIAGNOSTICS ENHANCED...");
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import mattersRouter from './routes/matters';
import bridgesRouter from './routes/bridges';
import rolesRouter from './routes/roles';
import webhooksRouter from './routes/webhooks';
import platformRouter from './routes/platform';
import documentTemplatesRouter from './routes/documentTemplates';
import documentsRouter from './routes/documents';
import rulesRouter from './routes/rules';
import analyticsRouter from './routes/analytics';
import usersRouter from './routes/users';
import pricingRouter from './routes/pricing';
import exportRouter from './routes/export';
import brandingRouter from './routes/branding';
import chatbotRouter from './routes/chatbot';
import tenantRouter from './routes/tenant';
import leadsRouter from './routes/leads';
import { sovereignGuard } from './middleware/sovereignGuard';
import { authenticateToken } from './middleware/auth';

const app = express();
// Force reload for env var update (Key Rotation 2)
const port = process.env.PORT || 3001;

// 1. Initial Logger (Pre-Parsing)
app.use((req, res, next) => {
    console.log(`[Audit] Incoming ${req.method} request to ${req.url}`);
    next();
});

// 2. Security & Parsing
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "https://accounts.google.com/gsi/client"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "https://accounts.google.com/gsi/client"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "https://accounts.google.com/gsi/style"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "https://lh3.googleusercontent.com"],
            connectSrc: ["'self'", "https:", "https://accounts.google.com/gsi/"],
            frameSrc: ["'self'", "https://accounts.google.com/"],
        },
    },
}));
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LexSovereign Control Plane' });
});

// Public / Lead Generation
app.use('/api/leads', leadsRouter);

// Authentication (Handshake/Login)
app.use('/api/auth', authRouter);

// Protected Sovereign Routes (Require x-sov-pin)
app.use('/api/pricing', sovereignGuard, pricingRouter);
app.use('/api/platform', sovereignGuard, platformRouter);
app.use('/api/document-templates', sovereignGuard, documentTemplatesRouter);
app.use('/api/branding-profiles', sovereignGuard, brandingRouter);
app.use('/api/documents', sovereignGuard, documentsRouter);
app.use('/api/rules', sovereignGuard, rulesRouter);
app.use('/api/users', sovereignGuard, usersRouter);
app.use('/api', sovereignGuard, apiRouter);

// Matter Management (Double Layer: Auth + Optional Sovereign Guard inside mattersRouter if needed)
app.use('/api/matters', authenticateToken, mattersRouter);
app.use('/api/bridges', authenticateToken, bridgesRouter);
app.use('/api/roles', authenticateToken, rolesRouter);
app.use('/api/webhooks', authenticateToken, webhooksRouter);
app.use('/api/analytics', authenticateToken, analyticsRouter);
app.use('/api/export', authenticateToken, exportRouter);
app.use('/api/chatbot', sovereignGuard, authenticateToken, chatbotRouter);
app.use('/api/tenant', authenticateToken, tenantRouter);

// Serve static files from the React app
// Priority 1: Check root dist (Standard Vite) - DISABLE default index.html serving here
app.use(express.static(path.join(__dirname, '../../dist'), { index: false }));
// Priority 2: Check server/public (Legacy/Fallback)
app.use(express.static(path.join(__dirname, '../public'), { index: false }));

import fs from 'fs';

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file with runtime injections.
app.get('*', (req, res) => {
    const distPath = path.join(__dirname, '../../dist/index.html');

    if (fs.existsSync(distPath)) {
        try {
            let html = fs.readFileSync(distPath, 'utf8');

            // Inject runtime variables (Fixes build-time environment variable issues)
            const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
            const sovereignPin = process.env.SOVEREIGN_PIN || '';

            console.log(`[Runtime Injection] URL: ${req.url} | ClientID: ${googleClientId ? 'PRESENT' : 'MISSING'}`);

            const injection = `
    <script>
      window._GOOGLE_CLIENT_ID = "${googleClientId}";
      window._SOVEREIGN_PIN_ = "${sovereignPin}";
      console.log("[Runtime] Credentials injected into client pulse.");
    </script>`;

            // Insert into head using regex for robustness
            html = html.replace(/<head>/i, `<head>${injection}`);

            res.send(html);
        } catch (error) {
            console.error("[Runtime Error] Failed to serve index.html:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(404).send("Application dist not found. Please run 'npm run build' first.");
    }
});

// Start server
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[Sovereign Proxy] Server running on port ${port}`);
    console.log(`[Sovereign Proxy] Environment: ${process.env.NODE_ENV}`);

    // Heartbeat to prove process is alive in logs
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        console.log(`[Heartbeat] RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`);
    }, 30000);
});

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
    // Give it time to flush logs before exit? Or just let it crash cleanly.
    // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
