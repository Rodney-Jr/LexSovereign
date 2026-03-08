import dotenv from 'dotenv';
import path from 'path';
// Load environment variables immediately
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';

// Global BigInt Serialization Fix
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

console.log("[VERSION CHECK] v5 - AUTH DIAGNOSTICS ENHANCED...");
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import mattersRouter from './routes/matters';
import workflowsRouter from './routes/workflows';
import aiRouter from './routes/ai';
import adminRouter from './routes/admin';
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
import chatConversationsRouter from './routes/chatConversations';
import fxRatesRouter from './routes/fxRates';
import contentEngineRouter from './routes/contentEngine';
import stripeRouter from './routes/stripe';
import billingRouter from './routes/billing';
import firmRouter from './routes/firm';
import accountingRouter from './routes/accounting';
import productivityRouter from './routes/productivity';
import { sovereignGuard } from './middleware/sovereignGuard';
import { authenticateToken } from './middleware/auth';
import { initCronJobs } from './services/cronService';
import { SchedulerService } from './services/SchedulerService';
import { startFxWebSocket } from './services/fxWebSocketService';

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

// Stripe Webhook needs raw body for signature verification
// This must be BEFORE express.json()
app.use('/api/stripe/webhook', stripeRouter);

app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'NomosDesk Control Plane' });
});

// Public / Lead Generation
app.use('/api/leads', leadsRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// Chat Conversations (Public for widget, Protected for admin)
app.use('/api/chat-conversations', chatConversationsRouter);

// FX Rates (Daily Sync)
app.use('/api/fx-rates', fxRatesRouter);

// Chat Attachments
app.use('/api/attachments', authenticateToken, express.static(path.join(__dirname, '../uploads')));

// Authentication (Handshake/Login)
app.use('/api/auth', authRouter);

// Tenant Actions (Must be above /api catchall)
app.use('/api/tenant', authenticateToken, tenantRouter);
app.use('/api/firm', authenticateToken, firmRouter);
app.use('/api/platform', sovereignGuard, platformRouter);
app.use('/api/document-templates', authenticateToken, documentTemplatesRouter);
app.use('/api/branding-profiles', sovereignGuard, brandingRouter);
app.use('/api/documents', authenticateToken, documentsRouter);
app.use('/api/rules', sovereignGuard, rulesRouter);
app.use('/api/users', sovereignGuard, usersRouter);
app.use('/api', sovereignGuard, apiRouter);

// Matter Management
app.use('/api/matters', authenticateToken, mattersRouter);
app.use('/api/bridges', authenticateToken, bridgesRouter);
app.use('/api/roles', authenticateToken, rolesRouter);
app.use('/api/webhooks', authenticateToken, webhooksRouter);
app.use('/api/analytics', authenticateToken, analyticsRouter);
app.use('/api/workflows', authenticateToken, workflowsRouter);
app.use('/api/export', authenticateToken, exportRouter);
app.use('/api/chatbot', sovereignGuard, authenticateToken, chatbotRouter);
app.use('/api/billing', authenticateToken, billingRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/productivity', productivityRouter);

// 3. Static Asset Resolution
import fs from 'fs';

// Resolve static directory paths using process.cwd() for reliability in root-run environments
const potentialDistPaths = [
    path.join(process.cwd(), 'client-dist'), // Docker production mapping
    path.join(process.cwd(), '../dist'),      // Local split-root mapping (running from server/)
    path.join(process.cwd(), 'dist'),         // Local monorepo mapping (running from root)
    path.join(__dirname, '../../client-dist'),// Container fallback
    path.join(__dirname, '../../../dist')     // Deeply nested fallback
];

let DIST_PATH = potentialDistPaths[1]; // Default to local split-root

for (const p of potentialDistPaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
        DIST_PATH = p;
        console.log(`[Static] Validated DIST_PATH at: ${DIST_PATH}`);
        break;
    }
}

const PUBLIC_PATH = path.join(process.cwd(), 'public');

console.log(`[Static] Serving assets from: ${DIST_PATH}`);

// Priority 1: Check root dist (Standard Vite)
app.use(express.static(DIST_PATH, { index: false }));

// Priority 2: Check server/public (Legacy/Fallback)
app.use(express.static(PUBLIC_PATH, { index: false }));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file with runtime injections.
app.get('*', (req, res) => {
    // SECURITY: Do not serve index.html for missing assets (prevents MIME type errors)
    if (req.url.startsWith('/assets/')) {
        console.warn(`[Static] Asset not found: ${req.url}`);
        return res.status(404).send('Asset not found');
    }

    const indexHtmlPath = path.join(DIST_PATH, 'index.html');

    if (fs.existsSync(indexHtmlPath)) {
        try {
            let html = fs.readFileSync(indexHtmlPath, 'utf8');

            // Inject runtime variables
            const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
            const sovereignPin = process.env.SOVEREIGN_PIN || '';

            const injection = `
    <script>
      window._GOOGLE_CLIENT_ID = "${googleClientId}";
      window._SOVEREIGN_PIN_ = "${sovereignPin}";
      console.log("[Runtime] Credentials injected into client pulse.");
    </script>`;

            html = html.replace(/<head>/i, `<head>${injection}`);
            res.send(html);
        } catch (error) {
            console.error("[Runtime Error] Failed to serve index.html:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(404).send("Application dist not found. Please ensure the frontend is built.");
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

    // Initialize Sovereign Cron System
    initCronJobs();

    // Start Workflow Scheduler
    SchedulerService.start();

    // Start FastForex real-time WebSocket feed
    startFxWebSocket();

    // Async Seeding (Non-blocking for Railway Healthcheck)
    if (process.env.NODE_ENV === 'production') {
        import('./scripts/seed').then(({ seedDatabase }) => {
            console.log('🌱 Starting Async Database Seeding...');
            seedDatabase().catch(err => console.error('❌ Async Seeding Failed:', err));
        }).catch(err => console.error('❌ Failed to load seed module:', err));
    }
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
