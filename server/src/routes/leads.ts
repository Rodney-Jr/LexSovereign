import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sendDemoProvisionedEmail } from '../services/EmailService';
import { TenantService } from '../services/TenantService';

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

        // Auto-provision a sovereign tenant and send welcome email (non-blocking)
        const tenantName = company || `${name}'s Firm`;
        TenantService.provisionTenant({
            name: tenantName,
            adminEmail: email,
            adminName: name,
            plan: 'STANDARD',
            region: 'GH_ACC_1'
        }).then(async (result) => {
            // Update lead status to CONVERTED
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: 'CONVERTED' }
            }).catch(() => { });

            // Send demo-specific welcome email with credentials
            return sendDemoProvisionedEmail({
                to: email,
                adminName: name,
                tenantName,
                tempPassword: result.tempPassword,
                loginUrl: result.loginUrl
            });
        }).catch(err => {
            console.error(`[DemoAutomation] Provisioning failed for ${email}:`, err.message);
        });

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
