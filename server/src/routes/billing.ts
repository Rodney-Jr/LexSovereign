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

/**
 * NEW: GET /api/billing/invoices
 * Returns all matter-level invoices for the tenant.
 */
router.get('/invoices', async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || (req as any).user?.tenant?.id;
        if (!tenantId) return res.status(401).json({ error: "Tenant context missing" });

        const invoices = await BillingService.getTenantInvoices(tenantId);
        res.json(invoices);
    } catch (error: any) {
        console.error("Failed to fetch invoices:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: GET /api/billing/invoices/:id
 * Returns detailed data for a specific invoice.
 */
router.get('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = (req as any).user?.tenantId || (req as any).user?.tenant?.id;

        const invoice = await BillingService.getInvoiceDetails(id, tenantId);
        res.json(invoice);
    } catch (error: any) {
        console.error("Failed to fetch invoice details:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: PATCH /api/billing/invoices/:id/status
 * Updates the status of an invoice.
 */
router.patch('/invoices/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tenantId = (req as any).user?.tenantId || (req as any).user?.tenant?.id;

        if (!status) return res.status(400).json({ error: "Status is required" });

        const updated = await BillingService.updateInvoiceStatus(id, status, tenantId);
        res.json(updated);
    } catch (error: any) {
        console.error("Failed to update invoice status:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: GET /api/billing/matters/:matterId/usage
 * Returns AI and Storage usage for a specific matter.
 */
router.get('/matters/:matterId/usage', async (req, res) => {
    try {
        const { matterId } = req.params;
        const tenantId = (req as any).user?.tenantId || (req as any).user?.tenant?.id;
        if (!tenantId) return res.status(401).json({ error: "Tenant context missing" });

        const usage = await BillingService.getMatterUsage(matterId, tenantId);
        res.json(usage);
    } catch (error: any) {
        console.error("Failed to fetch matter usage:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * NEW: GET /api/billing/matters/:matterId/disbursement-csv
 * Returns a CSV for law firms to bill clients for AI and Storage.
 */
router.get('/matters/:matterId/disbursement-csv', async (req, res) => {
    try {
        const { matterId } = req.params;
        const tenantId = (req as any).user?.tenantId || (req as any).user?.tenant?.id;
        if (!tenantId) return res.status(401).json({ error: "Tenant context missing" });

        const csv = await BillingService.generateClientDisbursementCSV(matterId, tenantId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="disbursement_${matterId}.csv"`);
        res.status(200).send(csv);
    } catch (error: any) {
        console.error("Failed to generate disbursement CSV:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
