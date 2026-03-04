import { Router } from 'express';
import { BillingService } from '../services/BillingService';

const router = Router();

// Create a new Billing Component (e.g. Flat Fee)
router.post('/components', async (req, res) => {
    try {
        const { matterId, type, config } = req.body;

        if (!matterId || !type) {
            return res.status(400).json({ error: "matterId and type are required" });
        }

        const component = await BillingService.createBillingComponent(matterId, type, config || {});

        // As a side effect, check if we need to auto-generate a deposit invoice
        // This normally runs on a cron, but good to check on creation if deposit required
        // We need tenantId for invoices. Pull from req.user if available.
        const tenantId = (req as any).user?.tenant?.id || (req as any).user?.tenantId;
        if (tenantId) {
            await BillingService.evaluateInvoicingTriggers(matterId, tenantId);
        }

        res.json(component);
    } catch (error: any) {
        console.error("Failed to create billing component:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update Flat Fee Amount
router.put('/components/:id/flat-fee', async (req, res) => {
    try {
        const { id } = req.params;
        const { newAmount, justification } = req.body;
        const userId = (req as any).user?.id || 'SYSTEM';

        if (!newAmount || !justification) {
            return res.status(400).json({ error: "newAmount and justification are required" });
        }

        const updated = await BillingService.updateFlatFeeAmount(id, parseFloat(newAmount), userId, justification);
        res.json(updated);
    } catch (error: any) {
        console.error("Failed to update flat fee:", error);
        res.status(500).json({ error: error.message });
    }
});
// Get Financial Aggregates
router.get('/financials', async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenant?.id || (req as any).user?.tenantId;
        const { type } = req.query; // 'CASE' or 'CONTRACT'

        if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

        const data = await BillingService.getAggregateFinancials(tenantId, type as any || 'CASE');
        res.json(data);
    } catch (error: any) {
        console.error("Failed to fetch financials:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
