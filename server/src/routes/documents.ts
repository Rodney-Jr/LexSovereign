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

        const isGlobalAdmin = req.user.role === 'GLOBAL_ADMIN';
        const documents = await prisma.document.findMany({
            where: isGlobalAdmin ? {} : {
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
            matterName: doc.matter.name,
            attributes: doc.attributes || {}
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

        const isGlobalAdmin = req.user.role === 'GLOBAL_ADMIN';
        const documents = await prisma.document.findMany({
            where: {
                matterId,
                matter: isGlobalAdmin ? {} : {
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

        // 1. Verify Matter and Tenant Mode
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            include: { tenant: true }
        });

        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        if (!matter || (!isGlobalAdmin && matter.tenantId !== tenantId)) {
            res.status(403).json({ error: 'Invalid Matter ID' });
            return;
        }

        const encryptionMode = matter.tenant.encryptionMode;
        let isEncrypted = false;
        let encryptionIV: string | undefined;
        let encryptionKeyId: string | undefined;

        if (encryptionMode === 'BYOK') {
            const { randomBytes } = await import('crypto');
            isEncrypted = true;
            encryptionIV = randomBytes(12).toString('base64');
            encryptionKeyId = `tenant-key-${tenantId}`; // In production, this would be a KMS Alias
        }

        // 2. Create Document Record
        let uri = `silo://${tenantId}/${matterId}/${name.replace(/\s+/g, '_')}`;

        // If content is provided, save it to disk
        if (req.body.content) {
            const { saveDocumentContent } = await import('../utils/fileStorage');
            // Note: fileStorage needs to pass encryptionContext to LocalStorageAdapter
            const relativePath = await saveDocumentContent(
                tenantId,
                matterId,
                `${name}.md`,
                req.body.content,
                isEncrypted ? { keyId: encryptionKeyId!, algorithm: 'AES-256-GCM', iv: encryptionIV! } : undefined
            );
            uri = `file://${relativePath}`;
        }

        const doc = await prisma.document.create({
            data: {
                name,
                uri,
                jurisdiction: region || 'GH_ACC_1',
                classification: classification || 'Confidential',
                privilege: privilege || 'INTERNAL',
                matterId,
                isEncrypted,
                encryptionIV,
                encryptionKeyId,
                attributes: { type, size }
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
            encryption: isEncrypted ? 'BYOK' : 'SYSTEM'
        });

    } catch (error: any) {
        console.error("Document creation failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get documents needing review
router.get('/review-needed', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const isGlobalAdmin = req.user.role === 'GLOBAL_ADMIN';
        const documents = await prisma.document.findMany({
            where: {
                matter: isGlobalAdmin ? {} : {
                    tenantId: req.user.tenantId
                },
                status: { not: 'APPROVED' }
            },
            include: {
                matter: true
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const artifacts = documents.map(doc => ({
            id: doc.id,
            title: doc.name,
            matterId: doc.matterId,
            matter: doc.matter.name,
            jurisdiction: doc.jurisdiction,
            lastActivity: doc.updatedAt.toLocaleDateString(),
            complianceScore: 92,
            riskLevel: (doc.classification === 'Strictly Confidential') ? 'HIGH' : 'LOW',
            status: doc.status,
            urgency: doc.classification === 'Strictly Confidential' ? 'Critical' : 'Routine',
            aiConfidence: (doc.attributes as any)?.aiConfidence || 0.95,
            piiCount: (doc.attributes as any)?.piiCount || 0
        }));

        res.json(artifacts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get document content
router.get('/:id/content', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        if (!isGlobalAdmin && doc.matter.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // In a real app, read from storage (uri)
        // For now, return the URI or a placeholder if it's a seed
        let content = `[ENCLAVE CONTENT]: Original artifact content for '${doc.name}' at URI ${doc.uri}. 
        Jurisdiction: ${doc.jurisdiction}. 
        Classification: ${doc.classification}.
        Integrity Hash: 0x${Math.random().toString(16).substr(2, 8)}`;

        res.json({ content });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Approve document
router.post('/:id/approve', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        if (!isGlobalAdmin && doc.matter.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: {
                status: 'APPROVED',
                lastReviewed: new Date()
            }
        });

        res.json({ success: true, status: updated.status });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get audit logs for a client (scoped to their matters)
router.get('/client-audit', authenticateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Fetch matters for this tenant
        const matters = await prisma.matter.findMany({
            where: { tenantId: req.user.tenantId },
            select: { id: true }
        });

        const matterIds = matters.map(m => m.id);

        // 2. Fetch audit logs related to these matters or their documents
        const documents = await prisma.document.findMany({
            where: { matterId: { in: matterIds } },
            select: { id: true }
        });

        const docIds = documents.map(d => d.id);
        const allTargetIds = [...matterIds, ...docIds];

        const logs = await prisma.auditLog.findMany({
            where: {
                resourceId: { in: allTargetIds }
            },
            take: 10,
            orderBy: { timestamp: 'desc' }
        });

        const formattedLogs = logs.map(log => {
            // SAFE NULL CHECK for details
            const logDetails = log.details || "";
            return {
                id: log.id,
                type: log.action.includes('ENCLAVE') ? 'ENCLAVE' :
                    log.action.includes('AI') ? 'AI' :
                        log.action.includes('SECURITY') || log.action.includes('SCRUB') ? 'SECURITY' : 'JURISDICTION',
                message: logDetails.length > 50 ? `${logDetails.substring(0, 50)}...` : logDetails,
                timestamp: new Date(log.timestamp).toLocaleTimeString() + ' ' + new Date(log.timestamp).toLocaleDateString()
            };
        });

        res.json(formattedLogs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
