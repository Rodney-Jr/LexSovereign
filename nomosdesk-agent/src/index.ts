import * as chokidar from 'chokidar';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

// Configuration
const WATCH_DIR = process.env.WATCH_DIR;
const API_URL = process.env.API_URL || 'http://localhost:3001';
const AGENT_API_KEY = process.env.AGENT_API_KEY;
const DEFAULT_MATTER_ID = process.env.DEFAULT_MATTER_ID || '';

// Subdirectories for state management
const PROCESSING_DIR = path.join(WATCH_DIR || '', '_processing');
const COMPLETED_DIR = path.join(WATCH_DIR || '', '_completed');
const ERROR_DIR = path.join(WATCH_DIR || '', '_error');

// Simple logger
const log = (msg: string) => console.log(`[${new Date().toISOString()}] [NomosDesk Agent] ${msg}`);
const logError = (msg: string, err?: any) => console.error(`[${new Date().toISOString()}] [NomosDesk Agent] ERROR: ${msg}`, err || '');

async function init() {
    log('Initializing Local Sync Agent...');

    if (!WATCH_DIR) {
        logError('WATCH_DIR environment variable is required.');
        process.exit(1);
    }
    if (!AGENT_API_KEY) {
        logError('AGENT_API_KEY environment variable is required.');
        process.exit(1);
    }

    // Ensure watch directory and subdirectories exist
    [WATCH_DIR, PROCESSING_DIR, COMPLETED_DIR, ERROR_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    log(`Configured to watch: ${WATCH_DIR}`);
    log(`Target Server: ${API_URL}`);

    // Initialize watcher
    // We ignore dotfiles and our own state directories
    const watcher = chokidar.watch(WATCH_DIR, {
        ignored: [
            /(^|[\/\\])\../,     // ignore dotfiles
            /node_modules/,
            PROCESSING_DIR,
            COMPLETED_DIR,
            ERROR_DIR,
            /^~/,                // ignore temporary files
        ],
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        },
        depth: 0 // Only watch top level for now, easy to change
    });

    watcher
        .on('add', handleFileAdd)
        .on('error', error => logError(`Watcher error: ${error}`))
        .on('ready', () => log('Initial scan complete. Ready for new files.'));
}

async function handleFileAdd(filePath: string) {
    const fileName = path.basename(filePath);
    log(`New file detected: ${fileName}`);

    const processingPath = path.join(PROCESSING_DIR, fileName);
    const completedPath = path.join(COMPLETED_DIR, fileName);
    const errorPath = path.join(ERROR_DIR, fileName);

    try {
        // 1. Move to processing to avoid double-processing
        fs.renameSync(filePath, processingPath);
        log(`Moved to processing: ${fileName}`);

        // 2. Upload to NomosDesk
        await uploadFile(processingPath, fileName);

        // 3. Move to completed
        fs.renameSync(processingPath, completedPath);
        log(`Successfully synced and moved to completed: ${fileName}`);

    } catch (error: any) {
        logError(`Failed to process ${fileName}`, error.message || error);
        
        // Move to error dir if it's currently in processing
        if (fs.existsSync(processingPath)) {
            try {
                fs.renameSync(processingPath, errorPath);
                log(`Moved failed file to error directory: ${fileName}`);
            } catch (e) {
                logError(`Could not move ${fileName} to error directory either.`);
            }
        }
    }
}

async function uploadFile(filePath: string, originalName: string) {
    log(`Uploading ${originalName} to ${API_URL}...`);
    
    const form = new FormData();
    form.append('document', fs.createReadStream(filePath));
    
    if (DEFAULT_MATTER_ID) {
        form.append('matterId', DEFAULT_MATTER_ID);
    }

    try {
        const response = await axios.post(`${API_URL}/api/agent/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'x-api-key': AGENT_API_KEY
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        if (response.data && response.data.success) {
            log(`Upload confirmed by server. Vault ID: ${response.data.documentId}`);
            return true;
        } else {
            throw new Error(`Server returned unexpected success payload for ${originalName}`);
        }
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`Server responded with ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error(`No response received from server. Is the server running?`);
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Request setup failed: ${error.message}`);
        }
    }
}

// Handle unexpected termination
process.on('SIGINT', () => {
    log('Gracefully shutting down...');
    process.exit(0);
});

// Start the daemon
init().catch(err => {
    logError('Fatal error during initialization:', err);
    process.exit(1);
});
