import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sendLeadAcknowledgmentEmail } from '../services/EmailService';

const router = express.Router();

// Public: Submit a new lead
router.post('/', async (req, res) => {
    try {
        const { email, name, company, phone, source } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: "Name and Email are required." });
        }

        const lead = await prisma.lead.create({
            data: {
                email,
                name,
                company,
                phone,
                source: source || 'WEB_MODAL',
                status: 'NEW'
            }
        });

        // Send acknowledgment email (non-blocking)
        sendLeadAcknowledgmentEmail({ to: email, name })
            .catch(err => console.error('[Email] Lead ack email failed:', err));

        res.status(201).json(lead);
    } catch (error: any) {
        console.error("Lead capture error:", error);
        res.status(500).json({ error: "Failed to capture lead." });
    }
});

// Admin: Get all leads
router.get('/', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(leads);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update lead status
router.patch('/:id/status', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await prisma.lead.update({
            where: { id },
            data: { status }
        });

        res.json(lead);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
