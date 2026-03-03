import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { WorkflowService } from '../services/WorkflowService';
import { CLMService } from '../services/CLMService';
import { LitigationService } from '../services/LitigationService';

const router = express.Router();

/**
 * Start a workflow for a specific matter
 */
router.post('/start', authenticateToken, async (req, res) => {
    try {
        const { matterId, workflowId } = req.body;
        const tenantId = req.user?.tenantId;

        if (!matterId || !workflowId || !tenantId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId, tenantId },
            include: { states: { where: { isInitial: true } } }
        });

        if (!workflow || workflow.states.length === 0) {
            return res.status(404).json({ error: 'Workflow or initial state not found' });
        }

        const initialState = workflow.states[0];
        const updatedMatter = await WorkflowService.transitionMatter(
            matterId,
            initialState.id,
            req.user?.id || 'SYSTEM',
            tenantId
        );

        res.json(updatedMatter);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Submit an approval for a workflow state
 */
router.post('/approve', authenticateToken, async (req, res) => {
    try {
        const { matterId, stateId, comments } = req.body;
        const userId = req.user?.id;

        if (!matterId || !stateId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const approval = await CLMService.addApproval(matterId, stateId, userId, comments);
        res.json(approval);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Initialize CLM Metadata for a matter
 */
router.post('/clm/initialize', authenticateToken, async (req, res) => {
    try {
        const { matterId, metadata } = req.body;
        const contractMetadata = await CLMService.initializeContract(matterId, metadata);
        res.json(contractMetadata);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create a new document version (Redlining)
 */
router.post('/documents/:id/versions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uri, summary } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const version = await CLMService.createVersion(id, { uri, userId, summary });
        res.json(version);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Initialize Litigation Metadata
 */
router.post('/litigation/initialize', authenticateToken, async (req, res) => {
    try {
        const { matterId, metadata } = req.body;
        const caseData = await LitigationService.initializeCase(matterId, metadata);
        res.json(caseData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Add a Deadline to a Case
 */
router.post('/litigation/deadline', authenticateToken, async (req, res) => {
    try {
        const { matterId, deadline } = req.body;
        const newDeadline = await LitigationService.addDeadline(matterId, deadline);
        res.json(newDeadline);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Schedule a Hearing
 */
router.post('/litigation/hearing', authenticateToken, async (req, res) => {
    try {
        const { matterId, hearing } = req.body;
        const newHearing = await LitigationService.scheduleHearing(matterId, hearing);
        res.json(newHearing);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Link Evidence (Exhibit)
 */
router.post('/litigation/evidence', authenticateToken, async (req, res) => {
    try {
        const { matterId, documentId, evidence } = req.body;
        const link = await LitigationService.linkEvidence(matterId, documentId, evidence);
        res.json(link);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all upcoming litigation deadlines for the tenant
 */
router.get('/litigation/deadlines', authenticateToken, async (req, res) => {
    try {
        const deadlines = await prisma.deadline.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                matter: true
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
        res.json(deadlines);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get upcoming hearings
 */
router.get('/litigation/hearings', authenticateToken, async (req, res) => {
    try {
        const hearings = await prisma.hearing.findMany({
            where: {
                hearingDate: {
                    gte: new Date()
                }
            },
            include: {
                matter: true
            },
            orderBy: {
                hearingDate: 'asc'
            }
        });
        res.json(hearings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get pending approvals for the current user
 */
router.get('/approvals/pending', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const approvals = await prisma.approval.findMany({
            where: { userId, status: 'PENDING' },
            include: {
                matter: true,
                workflowState: true
            }
        });
        res.json(approvals);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get upcoming renewals for the tenant
 */
router.get('/clm/renewals', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const renewals = await prisma.contractMetadata.findMany({
            where: {
                matter: { tenantId },
                renewalDate: { lte: thirtyDaysFromNow, gte: new Date() }
            },
            include: { matter: true }
        });
        res.json(renewals);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
