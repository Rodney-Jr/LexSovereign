import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all documents (scoped by tenant)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: {
                matter: {
                    tenantId: req.user.tenantId
                }
            },
            include: {
                matter: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to frontend DocumentMetadata format
        const mapped = documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.classification,
            size: 'Unknown', // In a real app, this would come from blob metadata
            uploadedBy: 'System', // Could link to User model later
            uploadedAt: doc.createdAt.toISOString(),
            region: doc.jurisdiction,
            classification: doc.classification,
            matterId: doc.matterId,
            matterName: doc.matter.name
        }));

        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get documents for a specific matter
router.get('/matter/:matterId', authenticateToken, async (req, res) => {
    try {
        const { matterId } = req.params;
        const documents = await prisma.document.findMany({
            where: {
                matterId,
                matter: {
                    tenantId: req.user.tenantId
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
