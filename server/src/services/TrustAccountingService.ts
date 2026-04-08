import { prisma } from '../db';
import { AccountingService } from './AccountingService';

export class TrustAccountingService {

    /**
     * Ensure Trust Liability Account exists
     */
    private static async getTrustLiabilityAccount(tenantId: string) {
        let account = await prisma.firmAccount.findFirst({
            where: { tenantId, category: 'TRUST_LIABILITY' }
        });
        if (!account) {
            account = await prisma.firmAccount.create({
                data: {
                    id: `${tenantId}-trust-liability`,
                    name: 'Client Trust Liability',
                    type: 'LIABILITY',
                    category: 'TRUST_LIABILITY',
                    tenantId: tenantId,
                    currency: 'GHS'
                }
            });
        }
        return account;
    }

    private static async getTrustAssetAccount(tenantId: string) {
        let account = await prisma.firmAccount.findFirst({
            where: { tenantId, category: 'TRUST' }
        });
        if (!account) {
            account = await prisma.firmAccount.create({
                data: {
                    id: `${tenantId}-trust-account`,
                    name: 'Trust Account (IOLTA)',
                    type: 'ASSET',
                    category: 'TRUST',
                    tenantId: tenantId,
                    currency: 'GHS'
                }
            });
        }
        return account;
    }

    /**
     * Record a new trust deposit for a specific client
     */
    static async recordTrustDeposit(tenantId: string, clientId: string, matterId: string | null, amount: number, reference: string, description: string) {
        if (amount <= 0) throw new Error("Deposit amount must be positive");

        const trustAsset = await this.getTrustAssetAccount(tenantId);
        const trustLiability = await this.getTrustLiabilityAccount(tenantId);

        return await prisma.$transaction(async (tx) => {
            // Create transaction in ledger with specific types
            const transaction = await tx.ledgerTransaction.create({
                data: {
                    tenantId,
                    clientId: clientId,
                    matterId: matterId, // Can be null if it's a general retainer
                    type: 'TRUST_DEPOSIT',
                    description,
                    reference,
                    entries: {
                        create: [
                            // Debit Bank Account (Increase Asset)
                            { accountId: trustAsset.id, debit: amount, credit: 0, description: `Client Deposit - ${clientId}` },
                            // Credit Client Liability (Increase Liability)
                            { accountId: trustLiability.id, debit: 0, credit: amount, description: `Trust Liability - ${clientId}` }
                        ]
                    }
                },
                include: { entries: true }
            });

            // Update running balances
            await tx.firmAccount.update({
                where: { id: trustAsset.id },
                data: { balance: { increment: amount } }
            });
            await tx.firmAccount.update({
                where: { id: trustLiability.id },
                data: { balance: { increment: amount } }
            });

            return transaction;
        });
    }

    /**
     * Drawdown trust funds (typically to pay an invoice)
     */
    static async recordTrustDrawdown(tenantId: string, clientId: string, matterId: string | null, amount: number, reference: string, description: string) {
        if (amount <= 0) throw new Error("Drawdown amount must be positive");

        // Ensure sufficient balance
        const ledger = await this.getClientTrustLedger(tenantId, clientId);
        if (ledger.balance < amount) {
            throw new Error(`Insufficient trust funds. Client has ${ledger.balance}, attempted drawdown: ${amount}`);
        }

        const trustAsset = await this.getTrustAssetAccount(tenantId);
        const trustLiability = await this.getTrustLiabilityAccount(tenantId);
        const operatingAsset = await prisma.firmAccount.findFirst({ where: { tenantId, category: 'BANK' } });
        if (!operatingAsset) throw new Error("Operating bank account not found for drawdown transfer.");

        return await prisma.$transaction(async (tx) => {
            // Create the TRUST_DRAWDOWN transaction
            const transaction = await tx.ledgerTransaction.create({
                data: {
                    tenantId,
                    clientId,
                    matterId,
                    type: 'TRUST_DRAWDOWN',
                    description,
                    reference,
                    entries: {
                        create: [
                            // 1. Reduce Trust Liability
                            { accountId: trustLiability.id, debit: amount, credit: 0, description: `Drawdown Liability - ${clientId}` },
                            // 2. Reduce Trust Asset
                            { accountId: trustAsset.id, debit: 0, credit: amount, description: `Drawdown Asset transfer` },
                            // 3. Increase Operating Asset
                            { accountId: operatingAsset.id, debit: amount, credit: 0, description: `Transfer from Trust for invoice ${reference}` },
                            // 4. We MUST credit something for the Operating Asset debit to keep it balanced.
                            // In a real system, we credit Accounts Receivable (AR). Here, we'll fetch an AR account.
                        ]
                    }
                }
            });

            // Need to fetch AR to make this work locally without throwing unbalanced error
            const arAccount = await prisma.firmAccount.findFirst({ where: { tenantId, category: 'ACCOUNTS_RECEIVABLE' } });
            if (!arAccount) throw new Error("Accounts Receivable account not found.");
            
            // Add the missing credit entry to the newly created transaction
            await tx.ledgerEntry.create({
                data: {
                    transactionId: transaction.id,
                    accountId: arAccount.id,
                    debit: 0,
                    credit: amount,
                    description: `Trust checkout toward AR`
                }
            });

            // Update running balances
            await tx.firmAccount.update({ where: { id: trustLiability.id }, data: { balance: { decrement: amount } } });
            await tx.firmAccount.update({ where: { id: trustAsset.id }, data: { balance: { decrement: amount } } });
            await tx.firmAccount.update({ where: { id: operatingAsset.id }, data: { balance: { increment: amount } } });
            await tx.firmAccount.update({ where: { id: arAccount.id }, data: { balance: { decrement: amount } } }); // Credit AR drops it.

            // Also, if invoiceId is provided in reference, we should ideally mark that invoice as paid. For now the ledger is balanced.
            
            return transaction;
        });
    }

    /**
     * Get Trust Balance and Ledger for a specific client
     */
    static async getClientTrustLedger(tenantId: string, clientId: string) {
        const transactions = await prisma.ledgerTransaction.findMany({
            where: {
                tenantId,
                clientId,
                type: { in: ['TRUST_DEPOSIT', 'TRUST_DRAWDOWN'] }
            },
            include: { entries: true },
            orderBy: { createdAt: 'desc' }
        });

        let balance = 0;
        const formattedTransactions = transactions.map(t => {
            // For deposits, we take the amount. For drawdowns, it's negative.
            // A deposit has a credit to liability.
            const isDeposit = t.type === 'TRUST_DEPOSIT';
            // We just look at the first entry's amount. Since we debit/credit the same amount.
            const amountEntry = t.entries[0];
            const amount = Math.max(amountEntry.debit, amountEntry.credit); // safe way to get the magnitude
            
            const signedAmount = isDeposit ? amount : -amount;
            balance += signedAmount; // Actually, the running balance should be computed chronological, but we can just sum.

            return {
                id: t.id,
                date: t.createdAt,
                type: t.type,
                description: t.description,
                reference: t.reference,
                amount: signedAmount
            };
        });

        // Recalculate true absolute balance
        balance = formattedTransactions.reduce((acc, t) => acc + t.amount, 0);

        return {
            clientId,
            balance,
            transactions: formattedTransactions
        };
    }
}
