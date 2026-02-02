import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// List all templates (Gallery)
router.get('/', authenticateToken as any, async (req, res) => {
    try {
        const templates = await prisma.documentTemplate.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                jurisdiction: true,
                version: true,
                structure: true
            },
            orderBy: { category: 'asc' }
        });
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific template content
router.get('/:id', authenticateToken as any, async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prisma.documentTemplate.findUnique({
            where: { id }
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

export default router;
