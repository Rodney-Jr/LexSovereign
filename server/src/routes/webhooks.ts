import express from 'express';
import { GazetteService } from '../services/gazetteService';

const router = express.Router();

// Webhook endpoint for Statutory Gazette / DPC updates
router.post('/statutory-gazette', async (req, res) => {
    try {
        const signature = req.headers['x-gazette-sig'] as string;

        if (!signature) {
            return res.status(401).json({ error: 'Missing Cryptographic Signature' });
        }

        const result = await GazetteService.ingestUpdate(req.body, signature);

        if (!result.success) {
            return res.status(403).json({ error: result.message });
        }

        return res.json({ status: 'ok', detail: result.message });
    } catch (error: any) {
        console.error('[Webhook] Error processing update:', error);
        return res.status(500).json({ error: 'Internal Statutory Sync Error' });
    }
});

export default router;
