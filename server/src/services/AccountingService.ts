
import { prisma } from '../db';

export class AccountingService {
    /**
     * Initialize default chart of accounts for a new tenant
     */
    static async seedDefaultAccounts(tenantId: string) {
        const defaultAccounts = [
            { name: 'Operating Account', type: 'ASSET', category: 'BANK' },
            { name: 'Trust Account (IOLTA)', type: 'ASSET', category: 'TRUST' },
            { name: 'Accounts Receivable', type: 'ASSET', category: 'ACCOUNTS_RECEIVABLE' },
            { name: 'Office Equipment', type: 'ASSET', category: 'FIXED_ASSETS' },
            { name: 'Accounts Payable', type: 'LIABILITY', category: 'ACCOUNTS_PAYABLE' },
            { name: 'Legal Service Revenue', type: 'REVENUE', category: 'SERVICE_REVENUE' },
            { name: 'Office Rent & Utilities', type: 'EXPENSE', category: 'OPERATING_EXPENSE' },
            { name: 'Professional Indemnity Insurance', type: 'EXPENSE', category: 'OPERATING_EXPENSE' },
        ];

        for (const acc of defaultAccounts) {
            await prisma.firmAccount.upsert({
                where: { id: `${tenantId}-${acc.name.replace(/\s+/g, '-').toLowerCase()}` },
                update: {},
                create: {
                    id: `${tenantId}-${acc.name.replace(/\s+/g, '-').toLowerCase()}`,
                    name: acc.name,
                    type: acc.type,
                    category: acc.category,
                    tenantId: tenantId,
                    currency: 'GHS'
                }
            });
        }
    }

    /**
     * Post a new double-entry transaction
     */
    static async postTransaction(data: {
        tenantId: string,
        description: string,
        reference?: string,
        entries: { accountId: string, debit: number, credit: number, description?: string }[]
    }) {
        // 1. Verify that debits equal credits
        const totalDebits = data.entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredits = data.entries.reduce((sum, e) => sum + e.credit, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.001) {
            throw new Error(`Unbalanced transaction: Debits (${totalDebits}) do not equal Credits (${totalCredits})`);
        }

        return await prisma.$transaction(async (tx) => {
            // 2. Create the LedgerTransaction
            const transaction = await tx.ledgerTransaction.create({
                data: {
                    description: data.description,
                    reference: data.reference,
                    tenantId: data.tenantId,
                    entries: {
                        create: data.entries.map(e => ({
                            accountId: e.accountId,
                            debit: e.debit,
                            credit: e.credit,
                            description: e.description
                        }))
                    }
                },
                include: { entries: true }
            });

            // 3. Update account balances
            for (const entry of data.entries) {
                const account = await tx.firmAccount.findUnique({ where: { id: entry.accountId } });
                if (!account) throw new Error(`Account not found: ${entry.accountId}`);

                // Basic balance logic: 
                // Assets & Expenses: Balance = Balance + (Debit - Credit)
                // Liabilities, Equity, Revenue: Balance = Balance + (Credit - Debit)
                let balanceChange = 0;
                if (['ASSET', 'EXPENSE'].includes(account.type)) {
                    balanceChange = entry.debit - entry.credit;
                } else {
                    balanceChange = entry.credit - entry.debit;
                }

                await tx.firmAccount.update({
                    where: { id: entry.accountId },
                    data: { balance: { increment: balanceChange } }
                });
            }

            return transaction;
        });
    }

    /**
     * Get Chart of Accounts with current balances
     */
    static async getChartOfAccounts(tenantId: string) {
        return await prisma.firmAccount.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Get Trial Balance
     */
    static async getTrialBalance(tenantId: string) {
        const accounts = await this.getChartOfAccounts(tenantId);
        const debits = (accounts as any[]).filter(a => ['ASSET', 'EXPENSE'].includes(a.type)).reduce((sum: number, a: any) => sum + a.balance, 0);
        const credits = (accounts as any[]).filter(a => !['ASSET', 'EXPENSE'].includes(a.type)).reduce((sum: number, a: any) => sum + a.balance, 0);

        return { accounts, debits, credits, isBalanced: Math.abs(debits - credits) < 0.01 };
    }

    /**
     * Get Profit & Loss Statement (Revenue - Expenses)
     */
    static async getProfitAndLoss(tenantId: string, startDate?: Date, endDate?: Date) {
        const accounts = await (prisma as any).firmAccount.findMany({
            where: { tenantId, type: { in: ['REVENUE', 'EXPENSE'] } },
            include: {
                entries: {
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }
            }
        });

        const revenue = (accounts as any[]).filter(a => a.type === 'REVENUE').reduce((sum: number, a: any) => sum + a.balance, 0);
        const expenses = (accounts as any[]).filter(a => a.type === 'EXPENSE').reduce((sum: number, a: any) => sum + a.balance, 0);

        return {
            revenue,
            expenses,
            netIncome: revenue - expenses,
            accounts: (accounts as any[]).map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance }))
        };
    }

    /**
     * Get Balance Sheet (Assets = Liabilities + Equity)
     */
    static async getBalanceSheet(tenantId: string) {
        const accounts = await (prisma as any).firmAccount.findMany({
            where: { tenantId, type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] } }
        });

        // We also need to factor in current Net Income into Equity (Retained Earnings)
        const pl = await this.getProfitAndLoss(tenantId);

        const assets = (accounts as any[]).filter(a => a.type === 'ASSET').reduce((sum: number, a: any) => sum + a.balance, 0);
        const liabilities = (accounts as any[]).filter(a => a.type === 'LIABILITY').reduce((sum: number, a: any) => sum + a.balance, 0);
        const equity = (accounts as any[]).filter(a => a.type === 'EQUITY').reduce((sum: number, a: any) => sum + a.balance, 0) + pl.netIncome;

        return {
            assets,
            liabilities,
            equity,
            isBalanced: Math.abs(assets - (liabilities + equity)) < 0.01,
            accounts: (accounts as any[]).map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance }))
        };
    }

    /**
     * Get Trust Ledger (IOLTA Activity)
     */
    static async getTrustLedger(tenantId: string) {
        const trustAccount = await (prisma as any).firmAccount.findFirst({
            where: { tenantId, category: 'TRUST' }
        });

        if (!trustAccount) return { entries: [], balance: 0 };

        const transactions = await (prisma as any).ledgerTransaction.findMany({
            where: {
                tenantId,
                entries: { some: { accountId: trustAccount.id } }
            },
            include: { entries: { where: { accountId: trustAccount.id } } },
            orderBy: { date: 'desc' }
        });

        return {
            balance: trustAccount.balance,
            transactions: (transactions as any[]).map(t => ({
                id: t.id,
                date: t.date,
                description: t.description,
                reference: t.reference,
                amount: t.entries[0].debit - t.entries[0].credit
            }))
        };
    }
}
