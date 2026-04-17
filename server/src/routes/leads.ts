import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sendDemoProvisionedEmail } from '../services/EmailService';
import { TenantService } from '../services/TenantService';
import cors from 'cors';

const router = express.Router();
 
// Allow lead submissions from any origin (including local file:// for testing)
router.use(cors({ 
    origin: (origin, callback) => callback(null, true), 
    credentials: false 
}));

// Hybrid: Submit a new lead (public or authenticated)
router.post('/', async (req: any, res) => {
    try {
        const { email, name, company, phone, source, tenantId, notes } = req.body;
        
        // If the request is authenticated, prefer the user's tenantId for manual logs
        // This prevents a tenant from accidentally logging a lead to another firm
        const authTenantId = req.user?.tenantId;

        if (!email || !name) {
            return res.status(400).json({ error: "Name and Email are required." });
        }

        const leadData: any = {
            email,
            name,
            company,
            phone,
            source: source || (authTenantId ? 'MANUAL_ENTRY' : 'WEB_MODAL'),
            status: 'NEW',
            tenantId: tenantId || authTenantId || null,
            notes: notes || null,
            metadata: req.body.metadata || {}
        };

        const lead = await prisma.lead.create({
            data: leadData
        });

        // AUTO-PROVISIONING: Only for platform-level leads (no tenant context at all)
        if (!leadData.tenantId && source !== 'FOUNDING_PILOT') {
            const tenantName = company || `${name}'s Firm`;
            
            TenantService.provisionTenant({
                name: tenantName,
                adminEmail: email,
                adminName: name,
                plan: 'STANDARD',
                region: 'GH_ACC_1'
            }).then(async (result) => {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: 'CONVERTED' }
                }).catch(() => { });

                return sendDemoProvisionedEmail({
                    to: email,
                    adminName: name,
                    tenantName,
                    tempPassword: 'Check your email for setup instructions',
                    loginUrl: result.loginUrl
                });
            }).catch(err => {
                console.error(`[DemoAutomation] Provisioning failed for ${email}:`, err.message);
            });
        }

        res.status(201).json(lead);
    } catch (error: any) {
        console.error("Lead capture error:", error);
        res.status(500).json({ error: "Failed to capture lead." });
    }
});


// Admin/Tenant: Get leads (scoped)
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        const tenantId = req.user?.tenantId;

        const where: any = {};
        if (!isGlobalAdmin) {
            // Regular tenants only see their own leads
            if (!tenantId) return res.status(403).json({ error: "Tenant context required" });
            where.tenantId = tenantId;
        }

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(leads);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update lead status (scoped)
router.patch('/:id/status', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        const tenantId = req.user?.tenantId;

        // Verify ownership if not global admin
        if (!isGlobalAdmin) {
            const existing = await (prisma as any).lead.findUnique({ where: { id } });
            if (!existing || existing.tenantId !== tenantId) {
                return res.status(403).json({ error: "Permission denied or lead not found." });
            }
        }

        const lead = await (prisma as any).lead.update({
            where: { id },
            data: { 
                status,
                notes: notes !== undefined ? notes : undefined
            }
        });

        res.json(lead);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
