import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { DocumentAssemblyService } from '../services/DocumentAssemblyService';
import { DocumentExportService } from '../services/DocumentExportService';
import { readDocumentContent } from '../utils/fileStorage';

const router = express.Router();

/**
 * POST /api/documents/:id/export
 * Body: { format: 'DOCX' | 'PDF', brandingProfileId?: string }
 */
router.post('/:id/export', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { format, brandingProfileId } = req.body;
        const tenantId = req.user?.tenantId;

        if (!format || !['DOCX', 'PDF'].includes(format)) {
            return res.status(400).json({ error: 'Invalid or missing export format' });
        }

        // 1. Fetch Document Record
        const document = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!document || document.matter.tenantId !== tenantId) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // 2. Fetch Branding Profile (Optional)
        let branding = null;
        if (brandingProfileId) {
            branding = await prisma.brandingProfile.findUnique({
                where: { id: brandingProfileId }
            });
            if (branding && branding.tenantId !== tenantId) {
                return res.status(403).json({ error: 'Invalid Branding Profile' });
            }
        }

        // 3. Retrieve Content
        const contentMatch = document.uri.match(/file:\/\/(.+)/);
        if (!contentMatch) {
            return res.status(500).json({ error: 'Document content is not stored locally' });
        }

        const rawContent = await readDocumentContent(contentMatch[1]);

        // 4. Parse Elements
        const lines = rawContent.split('\n');
        const elements = lines.map(line => {
            if (line.startsWith('# ')) return { type: 'HEADING', text: line.replace('# ', ''), level: 1 };
            if (line.match(/^\d+\. /)) return { type: 'HEADING', text: line, level: 2 };
            return { type: 'PARAGRAPH', text: line };
        }).filter(el => (el as any).text.trim().length > 0) as any;

        // 5. Generate Binary
        let buffer: Buffer;
        let contentType: string;
        let filename: string;

        if (format === 'DOCX') {
            buffer = await DocumentExportService.generateDOCX(elements, branding as any);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            filename = `${document.name}.docx`;
        } else {
            buffer = await DocumentExportService.generatePDF(elements, branding as any);
            contentType = 'application/pdf';
            filename = `${document.name}.pdf`;
        }

        // 6. Audit Log Entry
        await prisma.auditLog.create({
            data: {
                action: 'EXPORT',
                resourceId: document.id,
                userId: req.user?.id || 'SYSTEM',
                details: JSON.stringify({
                    format,
                    filename,
                    tenantId,
                    brandingProfileId: branding?.id,
                    brandingVersion: branding?.version
                })
            }
        });

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);

    } catch (error: any) {
        console.error('[Export] Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;
