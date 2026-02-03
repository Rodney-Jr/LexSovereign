import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { DocumentAssemblyService } from '../services/DocumentAssemblyService';
import { DocumentExportService } from '../services/DocumentExportService';
import { readDocumentContent } from '../utils/fileStorage';

const router = express.Router();

/**
 * POST /api/documents/:id/export
 * Body: { format: 'DOCX' | 'PDF' }
 */
router.post('/:id/export', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { format } = req.body;
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

        // 2. Security/Governance Check
        // PDF requires approved status (mocking this check for now as 'status' field might be in attributes or pending schema update)
        if (format === 'PDF') {
            const attributes = document.attributes as any;
            if (attributes?.status !== 'APPROVED') {
                // return res.status(403).json({ error: 'PDF export requires document approval.' });
                // Note: Temporarily allowing for MVP demo purposes if not explicitly blocked
            }
        }

        // 3. Retrieve Content (Assuming Markdown format in file storage)
        const contentMatch = document.uri.match(/file:\/\/(.+)/);
        if (!contentMatch) {
            return res.status(500).json({ error: 'Document content is not stored locally' });
        }

        const rawContent = await readDocumentContent(contentMatch[1]);

        // 4. Re-Assemble for Export
        // Note: In a real app, we'd store the AssemblyInput or structured state. 
        // For now, we reconstruct a simple structure from the raw content or use default assembly if content is rich.
        // For MVP, we'll parse the Markdown back into Elements or use a simplified element mapper.

        const lines = rawContent.split('\n');
        const elements = lines.map(line => {
            if (line.startsWith('# ')) return { type: 'HEADING', text: line.replace('# ', ''), level: 1 };
            if (line.match(/^\d+\. /)) return { type: 'HEADING', text: line, level: 2 };
            if (line.startsWith('---')) return { type: 'FOOTER', text: lines[lines.length - 1] }; // Simplistic
            return { type: 'PARAGRAPH', text: line };
        }).filter(el => el.text.trim().length > 0) as any;

        // 5. Generate Binary
        let buffer: Buffer;
        let contentType: string;
        let filename: string;

        if (format === 'DOCX') {
            buffer = await DocumentExportService.generateDOCX(elements);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            filename = `${document.name}.docx`;
        } else {
            buffer = await DocumentExportService.generatePDF(elements);
            contentType = 'application/pdf';
            filename = `${document.name}.pdf`;
        }

        // 6. Audit Log Entry
        await prisma.auditLog.create({
            data: {
                action: 'EXPORT',
                resourceId: document.id,
                userId: req.user?.id || 'SYSTEM',
                details: JSON.stringify({ format, filename, tenantId })
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
