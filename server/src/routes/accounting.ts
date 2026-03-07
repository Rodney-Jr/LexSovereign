import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { moduleGuard } from '../middleware/moduleGuard';
import { AccountingService } from '../services/AccountingService';
import { ReconciliationService } from '../services/ReconciliationService';

const router = Router();
// CRITICAL: authenticateToken MUST run BEFORE moduleGuard so req.user is populated
router.use(authenticateToken);
router.use(moduleGuard('ACCOUNTING_HUB'));

// Get Chart of Accounts
router.get('/accounts', authenticateToken, async (req, res) => {
    try {
        const tenantId = (req as any).user.tenantId;
        let accountsData = await AccountingService.getChartOfAccounts(tenantId);

        // Seed if first time
        if (accountsData.length === 0) {
            await AccountingService.seedDefaultAccounts(tenantId);
            accountsData = await AccountingService.getChartOfAccounts(tenantId);
        }

        res.json(accountsData);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get Trial Balance
router.get('/trial-balance', authenticateToken, async (req, res) => {
    try {
        const tb = await AccountingService.getTrialBalance((req as any).user.tenantId);
        res.json(tb);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Post a new transaction
router.post('/transactions', authenticateToken, async (req, res) => {
    try {
        const transaction = await AccountingService.postTransaction({
            ...req.body,
            tenantId: (req as any).user.tenantId
        });
        res.json(transaction);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Get Profit & Loss
router.get('/profit-loss', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const pl = await AccountingService.getProfitAndLoss(
            (req as any).user.tenantId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );
        res.json(pl);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get Balance Sheet
router.get('/balance-sheet', authenticateToken, async (req, res) => {
    try {
        const bs = await AccountingService.getBalanceSheet((req as any).user.tenantId);
        res.json(bs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get Trust Ledger
router.get('/trust-ledger', authenticateToken, async (req, res) => {
    try {
        const ledger = await AccountingService.getTrustLedger((req as any).user.tenantId);
        res.json(ledger);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Reconciliation
router.get('/reconciliation/pending', authenticateToken, async (req, res) => {
    try {
        const transactions = await ReconciliationService.getPendingBankTransactions((req as any).user.tenantId);
        res.json(transactions);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/reconciliation/suggestions/:bankTxId', authenticateToken, async (req, res) => {
    try {
        const suggestions = await ReconciliationService.suggestMatches((req as any).user.tenantId, req.params.bankTxId);
        res.json(suggestions);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/reconciliation/match', authenticateToken, async (req, res) => {
    try {
        const result = await ReconciliationService.matchTransaction(
            (req as any).user.tenantId,
            req.body.bankTransactionId,
            req.body.ledgerEntryId
        );
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

export default router;
