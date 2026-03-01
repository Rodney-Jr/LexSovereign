import express, { Request } from 'express';
import { LexAIService } from '../services/LexAIService';
import { DocumentAssemblyService } from '../services/DocumentAssemblyService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { prisma } from '../db';
import complianceRouter from './compliance';

const router = express.Router();
const geminiService = new LexAIService();

router.post('/chat', authenticateToken, async (req: Request, res) => {
    try {
        const { input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch, jurisdiction } = req.body;
        const result = await geminiService.chat(input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch, jurisdiction || 'GH');
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/briefing', authenticateToken, async (req: Request, res) => {
    try {
        const { matterId, documents } = req.body;
        const result = await geminiService.generateExecutiveBriefing(matterId, documents);
        res.json({ briefing: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/scrub', authenticateToken, async (req: Request, res) => {
    try {
        const { content, role, privilege, documentId } = req.body;
        const result = await geminiService.getScrubbedContent(content, role, privilege);

        // If documentId is provided, persist the count to attributes
        if (documentId && result.scrubbedEntities > 0) {
            const doc = await prisma.document.findUnique({ where: { id: documentId } });
            if (doc) {
                const existingAttr = (doc.attributes as any) || {};
                await prisma.document.update({
                    where: { id: documentId },
                    data: {
                        attributes: {
                            ...existingAttr,
                            scrubbedEntities: result.scrubbedEntities
                        }
                    }
                });
            }
        }

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/evaluate-rre', authenticateToken, async (req: Request, res) => {
    try {
        const { text, rules } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const tenantId = req.user.tenantId;
        const result = await geminiService.evaluateRRE(text, rules);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/public-chat', async (req, res) => {
    try {
        const { input, config, knowledge } = req.body;
        const result = await geminiService.publicChat(input, config, knowledge);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/billing-description', authenticateToken, async (req: Request, res) => {
    try {
        const { rawNotes } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = req.user;
        const result = await geminiService.generateBillingDescription(rawNotes);
        res.json({ description: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/audit/generate', authenticateToken, async (req: Request, res) => {
    try {
        const { userId, firmId, action, resourceType, resourceId } = req.body;
        // Verify user has permission to trigger audit logs (usually internal system or specific roles)
        // For now, allow authenticated users to generate logs for their actions
        const log = await geminiService.generateAuditLog({ userId, firmId, action, resourceType, resourceId });
        res.json({ message: log });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/documents/validate-export', authenticateToken, async (req: Request, res) => {
    try {
        const { content } = req.body;
        const result = await geminiService.validateDocumentExport(content);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/pricing/generate', authenticateToken, async (req: Request, res) => {
    try {
        const { features } = req.body;
        const result = await geminiService.generatePricingModel(features);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/document-templates', authenticateToken, async (req: Request, res) => {
    try {
        const templates = await prisma.documentTemplate.findMany();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/document-templates/:id', authenticateToken, async (req: Request, res) => {
    try {
        const template = await prisma.documentTemplate.findUnique({
            where: { id: req.params.id }
        });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/document-templates/:id/hydrate', authenticateToken, async (req: Request, res) => {
    try {
        const { matterId } = req.body;
        const template = await prisma.documentTemplate.findUnique({
            where: { id: req.params.id }
        });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }

        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            include: { documents: true }
        });

        if (!matter) {
            res.status(404).json({ error: 'Matter not found' });
            return;
        }

        const result = await geminiService.hydrateTemplate(template, matter);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/documents/assemble', authenticateToken, async (req: Request, res) => {
    try {
        const { template, variables, selectedOptionalKeys, metadata } = req.body;
        const result = DocumentAssemblyService.assemble({
            template,
            variables,
            selectedOptionalKeys,
            metadata
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/explain-clause', authenticateToken, async (req: Request, res) => {
    try {
        const { clauseText } = req.body;
        if (!clauseText) {
            res.status(400).json({ error: 'clauseText is required' });
            return;
        }
        const result = await geminiService.explainClause(clauseText);
        res.json({ explanation: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.use('/compliance', complianceRouter);

export default router;
