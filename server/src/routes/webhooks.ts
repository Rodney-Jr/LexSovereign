import express from 'express';
import { GazetteService } from '../services/gazetteService';

const router = express.Router();

// Webhook endpoint for Ghana Gazette / DPC updates
router.post('/ghana-gazette', async (req, res) => {
    try {
        const signature = req.headers['x-gazette-sig'] as string;

        if (!signature) {
            return res.status(401).json({ error: 'Missing Cryptographic Signature' });
        }

        const result = await GazetteService.ingestUpdate(req.body, signature);

        if (!result.success) {
            return res.status(403).json({ error: result.message });
        }

        res.json({ status: 'ok', detail: result.message });
    } catch (error: any) {
        console.error('[Webhook] Error processing update:', error);
        res.status(500).json({ error: 'Internal Statutory Sync Error' });
    }
});

export default router;
