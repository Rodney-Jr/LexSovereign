import { prisma } from '../db';
import { EventBus } from './eventBus';

export class CLMService {
    /**
     * Initialize metadata for a new Contract Matter
     */
    static async initializeContract(matterId: string, tenantId: string, initialMetadata: any) {
        return await prisma.contractMetadata.create({
            data: {
                matterId,
                tenantId,
                contractValue: initialMetadata.value || 0,
                currency: initialMetadata.currency || 'USD',
                counterpartyName: initialMetadata.counterparty,
                effectiveDate: initialMetadata.effectiveDate ? new Date(initialMetadata.effectiveDate) : null,
                renewalDate: initialMetadata.renewalDate ? new Date(initialMetadata.renewalDate) : null,
                expiryDate: initialMetadata.expiryDate ? new Date(initialMetadata.expiryDate) : null,
            }
        });
    }

    /**
     * Create a new document version (Redlining/Versioning)
     */
    static async createVersion(documentId: string, data: { uri: string, userId: string, summary?: string }) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get current versions to determine next version number
            const versions = await tx.documentVersion.findMany({
                where: { documentId },
                orderBy: { versionNumber: 'desc' },
                take: 1
            });

            const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

            // 2. Set all other versions to not current
            await tx.documentVersion.updateMany({
                where: { documentId },
                data: { isCurrent: false }
            });

            // 3. Create new version
            const document = await tx.document.findUnique({
                where: { id: documentId },
                select: { tenantId: true }
            });

            if (!document) throw new Error('Document not found');

            const version = await tx.documentVersion.create({
                data: {
                    documentId,
                    tenantId: document.tenantId,
                    versionNumber: nextVersion,
                    uri: data.uri,
                    authorId: data.userId,
                    changeSummary: data.summary,
                    isCurrent: true
                }
            });

            return version;
        });
    }

    /**
     * Logic for Quorum-based approvals
     */
    static async addApproval(matterId: string, stateId: string, userId: string, comments?: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch Matter to get tenantId
            const matter = await tx.matter.findUnique({
                where: { id: matterId },
                select: { tenantId: true }
            });

            if (!matter) throw new Error('Matter not found');

            // 2. Create the approval entry
            const approval = await tx.approval.create({
                data: {
                    matterId,
                    tenantId: matter.tenantId,
                    workflowStateId: stateId,
                    userId,
                    comments
                }
            });

            // 2. Check if the state's quorum requirements are met
            // This is a placeholder for more complex role-based logic
            const state = await tx.workflowState.findUnique({
                where: { id: stateId },
                include: { workflow: { include: { matterType: true } } }
            });

            if (state?.isApprovalRequired) {
                const approvals = await tx.approval.findMany({
                    where: { matterId, workflowStateId: stateId }
                });

                // Simple quorum: e.g., 2 approvals required for specific states
                const requiredApprovals = 1; // Default

                if (approvals.length >= requiredApprovals) {
                    // Emit event to notify that quorum is met, which could trigger a transition
                    EventBus.emit('QUORUM_MET', { matterId, stateId });
                }
            }

            return approval;
        });
    }
}
