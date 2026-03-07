
import { prisma } from '../db';
import { AccountingService } from './AccountingService';

export class ReconciliationService {
    /**
     * Import bank transactions (Mocking a bank feed)
     */
    static async importBankTransactions(tenantId: string, transactions: {
        date: Date,
        description: string,
        amount: number,
        type: 'DEBIT' | 'CREDIT',
        externalId: string,
        bankAccount?: string
    }[]) {
        const results = [];
        for (const tx of transactions) {
            const result = await (prisma as any).bankTransaction.upsert({
                where: { externalId: tx.externalId },
                update: {},
                create: {
                    ...tx,
                    tenantId,
                    status: 'PENDING'
                }
            });
            results.push(result);
        }
        return results;
    }

    /**
     * Get pending bank transactions
     */
    static async getPendingBankTransactions(tenantId: string) {
        return await (prisma as any).bankTransaction.findMany({
            where: { tenantId, status: 'PENDING' },
            orderBy: { date: 'desc' }
        });
    }

    /**
     * Match a bank transaction to a ledger entry
     */
    static async matchTransaction(tenantId: string, bankTransactionId: string, ledgerEntryId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get the transactions
            const bankTx = await (tx as any).bankTransaction.findUnique({
                where: { id: bankTransactionId }
            });
            const ledgerEntry = await (tx as any).ledgerEntry.findUnique({
                where: { id: ledgerEntryId }
            });

            if (!bankTx || !ledgerEntry) throw new Error("Transaction or Entry not found");

            // 2. Mark as reconciled
            await (tx as any).bankTransaction.update({
                where: { id: bankTransactionId },
                data: { status: 'MATCHED' }
            });

            await (tx as any).ledgerEntry.update({
                where: { id: ledgerEntryId },
                data: { reconciled: true }
            });

            return { success: true };
        });
    }

    /**
     * Suggest matches for a bank transaction
     */
    static async suggestMatches(tenantId: string, bankTransactionId: string) {
        const bankTx = await (prisma as any).bankTransaction.findUnique({
            where: { id: bankTransactionId }
        });

        if (!bankTx) return [];

        // Simple fuzzy matching: search for ledger entries with same amount (+/-) and nearby date
        const amount = Math.abs(bankTx.amount);
        const margin = 0.01;

        return await (prisma as any).ledgerEntry.findMany({
            where: {
                transaction: { tenantId },
                reconciled: false,
                OR: [
                    { debit: { gte: amount - margin, lte: amount + margin } },
                    { credit: { gte: amount - margin, lte: amount + margin } }
                ]
            },
            include: { transaction: true, account: true },
            take: 5
        });
    }
}
