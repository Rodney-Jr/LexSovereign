import { useState } from 'react';
import { UserRole, DocumentMetadata, AuditLogEntry } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants';

// Actions defined in the design
export type WorkflowAction = 'create_draft' | 'edit_draft' | 'submit_review' | 'approve_document' | 'export_final';

interface UseApprovalWorkflowProps {
    userRole: UserRole;
    userId: string;
}

export const useApprovalWorkflow = ({ userRole, userId }: UseApprovalWorkflowProps) => {
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

    /**
     * Check if the current user has the required permission for an action.
     */
    const canPerformAction = (action: WorkflowAction): boolean => {
        // Map role string (from enum) to permissions in constants
        // Note: types.ts UserRole keys match constants.ts keys
        const permissions = ROLE_DEFAULT_PERMISSIONS[userRole] || [];
        return permissions.includes(action);
    };

    /**
     * Validate if a document transition is allowed based on:
     * 1. User Permissions
     * 2. Document Status
     * 3. Separation of Duties (Approver != Creator)
     */
    const validateTransition = (
        doc: DocumentMetadata,
        action: WorkflowAction
    ): { allowed: boolean; reason?: string } => {

        // 1. Permission Check
        if (!canPerformAction(action)) {
            return { allowed: false, reason: `Role ${userRole} is not authorized to ${action}.` };
        }

        // 2. Logic & State Checks
        switch (action) {
            case 'edit_draft':
                if (doc.approvalStatus === 'REVIEW') {
                    return { allowed: false, reason: 'Cannot edit document while in REVIEW. Recall to DRAFT first.' };
                }
                if (doc.approvalStatus === 'APPROVED') {
                    return { allowed: false, reason: 'Cannot edit APPROVED documents.' };
                }
                break;

            case 'submit_review':
                if (doc.approvalStatus !== 'DRAFT') {
                    return { allowed: false, reason: 'Only DRAFT documents can be submitted for review.' };
                }
                break;

            case 'approve_document':
                if (doc.approvalStatus !== 'REVIEW') {
                    return { allowed: false, reason: 'Document must be in REVIEW status to be approved.' };
                }
                // Separation of Duties
                if (doc.creatorId === userId) {
                    return { allowed: false, reason: 'Separation of Duties Violation: Creator cannot approve their own document.' };
                }
                break;

            case 'export_final':
                if (doc.approvalStatus !== 'APPROVED') {
                    return { allowed: false, reason: 'Only APPROVED documents can be exported.' };
                }
                break;
        }

        return { allowed: true };
    };

    /**
     * Execute an action on a document, updating its state and logging the event.
     */
    const executeAction = (doc: DocumentMetadata, action: WorkflowAction): DocumentMetadata => {
        const validation = validateTransition(doc, action);
        if (!validation.allowed) {
            throw new Error(validation.reason);
        }

        const updatedDoc = { ...doc };

        // State Transitions
        switch (action) {
            case 'create_draft':
                updatedDoc.approvalStatus = 'DRAFT';
                updatedDoc.creatorId = userId;
                break;
            case 'edit_draft':
                // If we edit, we ensure it's Draft (though validation checks this too)
                updatedDoc.approvalStatus = 'DRAFT';
                break;
            case 'submit_review':
                updatedDoc.approvalStatus = 'REVIEW';
                break;
            case 'approve_document':
                updatedDoc.approvalStatus = 'APPROVED';
                break;
        }

        // Audit Logging
        const logEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            actor: userId,
            action: action,
            model: 'WorkflowEngine',
            promptVersion: 'v1.0', // N/A
            approvalToken: action === 'approve_document' ? `TOKEN-${Math.random().toString(36).substr(2, 9)}` : 'N/A',
            confidenceScore: 1.0,
            status: 'PROCEEDED'
        };

        setAuditLog(prev => [...prev, logEntry]);

        return updatedDoc;
    };

    return {
        canPerformAction,
        validateTransition,
        executeAction,
        auditLog
    };
};
