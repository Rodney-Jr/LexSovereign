import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import mattersRouter from './routes/matters';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LexSovereign Control Plane' });
});

app.use('/api/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/matters', mattersRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`[Sovereign Proxy] Server running on port ${port}`);
});
