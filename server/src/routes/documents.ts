import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all documents (scoped by tenant)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

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

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

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

// Create a new document
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, type, size, matterId, region, classification, privilege } = req.body;
        const tenantId = req.user?.tenantId;

        if (!name || !matterId || !tenantId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // 1. Verify Matter belongs to Tenant (Security Check)
        const matter = await prisma.matter.findUnique({
            where: { id: matterId }
        });

        if (!matter || matter.tenantId !== tenantId) {
            res.status(403).json({ error: 'Invalid Matter ID' });
            return;
        }

        // 2. Create Document Record
        const doc = await prisma.document.create({
            data: {
                name,
                uri: `silo://${tenantId}/${matterId}/${name.replace(/\s+/g, '_')}`, // Mock URI for MVP
                jurisdiction: region || 'GH_ACC_1', // Map region to jurisdiction
                classification: classification || 'Confidential',
                privilege: privilege || 'INTERNAL',
                matterId,
                attributes: { type, size } // Store extra metadata in JSON
            },
            include: {
                matter: true
            }
        });

        res.json({
            id: doc.id,
            name: doc.name,
            type: doc.classification,
            size: size || '0 KB',
            uploadedBy: req.user?.name || 'User',
            uploadedAt: doc.createdAt.toISOString(),
            region: doc.jurisdiction,
            classification: doc.classification,
            matterId: doc.matterId,
            matterName: doc.matter.name,
            privilege: doc.privilege,
            encryption: 'BYOK' // Default for now
        });

    } catch (error: any) {
        console.error("Document creation failed:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
