import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { moduleGuard } from '../middleware/moduleGuard';
import { AccountingService } from '../services/AccountingService';
import { ReconciliationService } from '../services/ReconciliationService';
import multer from 'multer';
import { DocumentParserService } from '../services/DocumentParserService';
import { LexAIService } from '../services/LexAIService';
import crypto from 'crypto';

const upload = multer({ storage: multer.memoryStorage() });
const lexAI = new LexAIService();

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

// Get Trust Ledger (IOLTA summary)
router.get('/trust-ledger', authenticateToken, async (req, res) => {
    try {
        const ledger = await AccountingService.getTrustLedger((req as any).user.tenantId);
        res.json(ledger);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

import { TrustAccountingService } from '../services/TrustAccountingService';

// Record Trust Deposit
router.post('/trust/deposit', authenticateToken, async (req, res) => {
    try {
        const { clientId, matterId, amount, reference, description } = req.body;
        const transaction = await TrustAccountingService.recordTrustDeposit(
            (req as any).user.tenantId, clientId, matterId, amount, reference, description
        );
        res.json(transaction);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Record Trust Drawdown
router.post('/trust/drawdown', authenticateToken, async (req, res) => {
    try {
        const { clientId, matterId, amount, reference, description } = req.body;
        const transaction = await TrustAccountingService.recordTrustDrawdown(
            (req as any).user.tenantId, clientId, matterId, amount, reference, description
        );
        res.json(transaction);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Get Specific Client Trust Ledger
router.get('/trust/client/:clientId', authenticateToken, async (req, res) => {
    try {
        // Additional RBAC validation here if the user is a client, ensuring they can only fetch their own clientId.
        const ledger = await TrustAccountingService.getClientTrustLedger((req as any).user.tenantId, req.params.clientId);
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

router.post('/reconciliation/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const tenantId = (req as any).user.tenantId;

        // 1. Extract Raw Text
        const rawText = await DocumentParserService.parse(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // 2. Extract JSON using AI
        const parsedTransactions = await lexAI.parseBankStatement(rawText);

        if (!Array.isArray(parsedTransactions) || parsedTransactions.length === 0) {
            return res.status(400).json({ error: "No transactions found or parsed in the document." });
        }

        // 3. Map to BankTransaction Format
        const transactionsToImport = parsedTransactions.map(tx => {
            // Generate deterministic hash to prevent duplicates
            const hashString = `${tx.date}-${tx.description}-${Math.abs(tx.amount)}-${tx.type}`;
            const externalId = crypto.createHash('md5').update(hashString).digest('hex');

            return {
                ...tx,
                date: new Date(tx.date),
                externalId
            };
        });

        // 4. Import into Database
        const results = await ReconciliationService.importBankTransactions(tenantId, transactionsToImport);

        res.json({ success: true, count: results.length });
    } catch (e: any) {
        console.error("Statement Upload Error:", e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
