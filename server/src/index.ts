import express from 'express';
console.log("[VERSION CHECK] v3 - FULL PRODUCTION MODE Starting...");
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import mattersRouter from './routes/matters';
import bridgesRouter from './routes/bridges';
import rolesRouter from './routes/roles';
import auditRouter from './routes/audit';
import webhooksRouter from './routes/webhooks';
import { sovereignGuard } from './middleware/sovereignGuard';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();
// Force reload for env var update (Key Rotation 2)
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
        },
    },
}));
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LexSovereign Control Plane' });
});

app.use('/api/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/matters', mattersRouter);
app.use('/api/bridges', bridgesRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/webhooks', webhooksRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
