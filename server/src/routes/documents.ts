import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import { saveDocumentContent } from '../utils/fileStorage';
import { ComplianceService } from '../services/ComplianceService';

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
                    tenantId: req.user.tenantId as string
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

        const documents = await prisma.document.findMany({
            where: {
                matterId,
                matter: {
                    tenantId: req.user.tenantId as string
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

const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/documents/upload
 * Binary upload for matter artifacts.
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
        const { matterId, region, classification, privilege } = req.body;
        const tenantId = req.user?.tenantId;
        const file = req.file;

        if (!file || !matterId || !tenantId) {
            return res.status(400).json({ error: 'Missing file or matterId' });
        }

        // Verify Matter Access
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            include: { tenant: true }
        });

        if (!matter || matter.tenantId !== (tenantId as string)) {
            return res.status(403).json({ error: 'Matter access denied' });
        }

        const encryptionMode = matter.tenant.encryptionMode;
        let isEncrypted = false;
        let encryptionIV: string | undefined;
        let encryptionKeyId: string | undefined;

        if (encryptionMode === 'BYOK') {
            const { randomBytes } = await import('crypto');
            isEncrypted = true;
            encryptionIV = randomBytes(12).toString('base64');
            encryptionKeyId = `tenant-key-${tenantId}`;
        }

        // Save Binary Content
        const relativePath = await saveDocumentContent(
            {
                id: matter.tenant.id,
                jurisdiction: (matter.tenant as any).jurisdiction || 'GH_ACC_1',
                storageBucketUri: (matter.tenant as any).storageBucketUri
            },
            matterId,
            file.originalname,
            file.buffer,
            isEncrypted ? { keyId: encryptionKeyId!, algorithm: 'AES-256-GCM', iv: encryptionIV! } : undefined
        );

        const uri = `file://${relativePath}`;

        // 🧠 Incept Sovereign AI Compliance Scrub
        const complianceData = await ComplianceService.analyzeFile(
            file.buffer, 
            file.originalname, 
            file.mimetype, 
            region || matter.tenant.primaryRegion || 'GHANA'
        );        const doc = await prisma.document.create({
            data: {
                name: file.originalname,
                uri,
                jurisdiction: region || (matter.tenant as any).jurisdiction || 'GH_ACC_1',
                classification: classification || 'Confidential',
                privilege: privilege || 'INTERNAL',
                tenantId: tenantId as string,
                matterId,
                isEncrypted,
                encryptionIV,
                encryptionKeyId,
                fileSize: BigInt(file.size),
                attributes: {
                    type: file.mimetype,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    originalName: file.originalname,
                    complianceScore: complianceData.complianceScore,
                    piiCount: complianceData.piiCount,
                    riskLevel: complianceData.riskLevel,
                    issues: complianceData.issues
                }
            },
            include: { matter: true }
        });

        // Create Initial Version
        await prisma.documentVersion.create({
            data: {
                documentId: doc.id,
                tenantId,
                versionNumber: 1,
                uri: doc.uri,
                authorId: req.user?.id,
                changeSummary: 'Initial upload',
                isCurrent: true
            }
        });

        res.status(201).json({
            id: doc.id,
            name: doc.name,
            type: doc.classification,
            size: (Number(doc.fileSize) / 1024).toFixed(1) + ' KB',
            uploadedBy: req.user?.name || 'User',
            uploadedAt: doc.createdAt.toISOString(),
            region: doc.jurisdiction,
            matterId: doc.matterId,
            matterName: (doc as any).matter.name
        });

    } catch (error: any) {
        console.error("Document upload failed:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, type, size, matterId, region, classification, privilege } = req.body;
        const tenantId = req.user?.tenantId;

        if (!name || !matterId || !tenantId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        let actualMatterId = matterId;

        // 1. Resolve magic string 'MT-GENERAL' to tenant's actual general matter
        if (matterId === 'MT-GENERAL') {
            let generalMatter = await prisma.matter.findFirst({
                where: { tenantId, name: 'General Enclave Matters' }
            });

            if (!generalMatter) {
                // Provision a general matter for this tenant on the fly if missing
                console.log(`[Backend] Provisioning missing General Enclave for tenant: ${tenantId}`);
                let internalClient = await prisma.client.findFirst({
                    where: { name: 'Firm Internal', tenantId: tenantId }
                });
                if (!internalClient) {
                    internalClient = await prisma.client.create({
                        data: { name: 'Firm Internal', tenantId: tenantId }
                    });
                }

                generalMatter = await prisma.matter.create({
                    data: {
                        name: 'General Enclave Matters',
                        clientId: internalClient.id,
                        type: 'ADMIN',
                        status: 'OPEN',
                        riskLevel: 'LOW',
                        tenantId: tenantId
                    }
                });
            }
            actualMatterId = generalMatter.id;
        }

        // 2. Verify Matter and Tenant Mode
        const matter = await prisma.matter.findUnique({
            where: { id: actualMatterId },
            include: { tenant: true }
        });

        if (!matter || matter.tenantId !== (tenantId as string)) {
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

        // Create Document Record
        let uri = `silo://${tenantId}/${matterId}/${name.replace(/\s+/g, '_')}`;
        let actualFileSize = 0n;

        // Parse human-readable size if provided (e.g. "1.2 MB")
        if (size && typeof size === 'string') {
            const match = size.match(/^([\d\.]+)\s*(KB|MB|GB|B)?$/i);
            if (match) {
                const val = parseFloat(match[1]);
                const unit = (match[2] || 'B').toUpperCase();
                const multiplier = unit === 'GB' ? 1024 ** 3 : unit === 'MB' ? 1024 ** 2 : unit === 'KB' ? 1024 : 1;
                actualFileSize = BigInt(Math.round(val * multiplier));
            }
        }

        // If content is provided, save it to disk and calculate size
        if (req.body.content) {
            const { saveDocumentContent } = await import('../utils/fileStorage');
            // Note: fileStorage needs to pass encryptionContext to LocalStorageAdapter
            const relativePath = await saveDocumentContent(
                {
                    id: matter.tenant.id,
                    jurisdiction: (matter.tenant as any).jurisdiction || 'GH_ACC_1',
                    storageBucketUri: (matter.tenant as any).storageBucketUri
                },
                actualMatterId,
                `${name}.md`,
                req.body.content,
                isEncrypted ? { keyId: encryptionKeyId!, algorithm: 'AES-256-GCM', iv: encryptionIV! } : undefined
            );
            uri = `file://${relativePath}`;
            actualFileSize = BigInt(Buffer.byteLength(req.body.content, 'utf8'));
        }

        // 🧠 Incept Sovereign AI Compliance Scrub (Text Drafts)
        let complianceData = undefined;
        if (req.body.content) {
             complianceData = await ComplianceService.analyzeDocument(
                req.body.content, 
                region || matter.tenant.primaryRegion || 'GHANA'
            );
        }

        const doc = await prisma.document.create({
            data: {
                name,
                uri,
                jurisdiction: region || (matter.tenant as any).jurisdiction || 'GH_ACC_1',
                classification: classification || 'Confidential',
                privilege: privilege || 'INTERNAL',
                matterId: actualMatterId,
                tenantId: tenantId as string,
                isEncrypted,
                encryptionIV,
                encryptionKeyId,
                fileSize: actualFileSize,
                attributes: { 
                    type, 
                    size: size || '0 KB',
                    ...(complianceData ? {
                        complianceScore: complianceData.complianceScore,
                        piiCount: complianceData.piiCount,
                        riskLevel: complianceData.riskLevel,
                        issues: complianceData.issues
                    } : {})
                }
            },
            include: {
                matter: true
            }
        });

        // Create Initial Version
        const version = await prisma.documentVersion.create({
            data: {
                documentId: doc.id,
                tenantId: tenantId as string,
                versionNumber: 1,
                uri: doc.uri,
                authorId: req.user?.id,
                changeSummary: 'Initial creation',
                isCurrent: true
            }
        });

        // Audit Log for Initial Creation
        await prisma.auditLog.create({
            data: {
                action: 'DOCUMENT_VERSION_CREATED',
                tenantId: tenantId as string,
                userId: req.user?.id,
                matterId: doc.matterId,
                resourceId: doc.id,
                details: `Vault Version 1 committed for artifact: ${doc.name}`,
                // metadata is not in schema or needs (prisma as any)
            } as any
        });

        // --- NEW: Forensic Activity Log (Phase 2) ---
        await prisma.activityEntry.create({
            data: {
                matterId: actualMatterId,
                tenantId: tenantId as string,
                type: 'DOCUMENT_CREATED',
                actorId: req.user?.id || null,
                details: `Artifact "${doc.name}" created/uploaded to the Matter Vault.`
            }
        });

        res.json({
            id: doc.id,
            name: doc.name,
            type: doc.classification,
            size: size || (Number(actualFileSize) / 1024).toFixed(1) + ' KB',
            uploadedBy: req.user?.name || 'User',
            uploadedAt: doc.createdAt.toISOString(),
            region: doc.jurisdiction,
            classification: doc.classification,
            matterId: doc.matterId,
            matterName: (doc as any).matter.name,
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

        const documents = await prisma.document.findMany({
            where: {
                matter: {
                    tenantId: req.user.tenantId as string
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

        if (doc.matter.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // 🛡️ [SECURITY] Audit document read access
        await prisma.auditLog.create({
            data: {
                action: 'DOCUMENT_CONTENT_READ',
                userId: req.user?.id,
                matterId: doc.matterId,
                resourceId: doc.id,
                details: `Artifact content read by user ${req.user?.email}. Classification: ${doc.classification}`,
            } as any
        });

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

        if (doc.matter.tenantId !== tenantId) {
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
            where: { tenantId: req.user.tenantId as string },
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
                type: log.action.includes('VERSION') ? 'VERSION' :
                    log.action.includes('ENCLAVE') ? 'ENCLAVE' :
                        log.action.includes('AI') ? 'AI' :
                            log.action.includes('SECURITY') || log.action.includes('SCRUB') ? 'SECURITY' : 'JURISDICTION',
                message: logDetails.length > 50 ? `${logDetails.substring(0, 50)}...` : logDetails,
                timestamp: new Date(log.timestamp).toLocaleTimeString() + ' ' + new Date(log.timestamp).toLocaleDateString(),
                metadata: (log as any).metadata || {}
            };
        });

        res.json(formattedLogs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single document by ID (used by Sovereign Sentinel and Review hub)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        if (doc.matter.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // 🛡️ [SECURITY] Audit document metadata pull
        await prisma.auditLog.create({
            data: {
                action: 'DOCUMENT_METADATA_READ',
                userId: req.user?.id,
                matterId: doc.matterId,
                resourceId: doc.id,
                details: `Artifact overview accessed. Classification: ${doc.classification}`,
            } as any
        });

        const content = `[VAULT DOCUMENT: ${doc.name}]\n\nJurisdiction: ${doc.jurisdiction}\nClassification: ${doc.classification}\nPrivilege: ${doc.privilege}\n\n---\n\n${doc.uri || 'Content pending vault integration.'}`;

        res.json({ ...doc, content });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        if (doc.matter.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.document.delete({ where: { id } });

        res.json({ success: true, id });
    } catch (error: any) {
        console.error('Document deletion failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update document (General purpose)
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, status, classification, privilege, matterId } = req.body;

        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        if (doc.matter.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const tenantId = req.user.tenantId!;
        let actualMatterId = matterId || doc.matterId;

        // Resolve magic string 'MT-GENERAL' to tenant's actual general matter
        if (matterId === 'MT-GENERAL') {
            let generalMatter = await prisma.matter.findFirst({
                where: { tenantId, name: 'General Enclave Matters' }
            });

            if (!generalMatter) {
                let internalClient = await prisma.client.findFirst({
                    where: { name: 'Firm Internal', tenantId: tenantId }
                });
                if (!internalClient) {
                    internalClient = await prisma.client.create({
                        data: { name: 'Firm Internal', tenantId: tenantId }
                    });
                }

                generalMatter = await prisma.matter.create({
                    data: {
                        name: 'General Enclave Matters',
                        clientId: internalClient.id,
                        type: 'ADMIN',
                        status: 'OPEN',
                        riskLevel: 'LOW',
                        tenantId: tenantId
                    }
                });
            }
            actualMatterId = generalMatter.id;
        }

        // Verify Matter if changed
        if (actualMatterId !== doc.matterId) {
            const matter = await prisma.matter.findUnique({
                where: { id: actualMatterId }
            });
            if (!matter || matter.tenantId !== tenantId) {
                return res.status(403).json({ error: 'Invalid Matter ID' });
            }
        }

        // Create new version if content or name changed
        const latestVersion = await prisma.documentVersion.findFirst({
            where: { documentId: id },
            orderBy: { versionNumber: 'desc' }
        });

        const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

        const [_, version] = await prisma.$transaction([
            prisma.documentVersion.updateMany({
                where: { documentId: id },
                data: { isCurrent: false }
            }),
            prisma.documentVersion.create({
                data: {
                    documentId: id,
                    tenantId: doc.tenantId,
                    versionNumber: nextVersionNumber,
                    uri: content || doc.uri,
                    authorId: req.user?.id,
                    changeSummary: req.body.changeSummary || 'Artifact update',
                    isCurrent: true
                }
            }),
            prisma.document.update({
                where: { id },
                data: {
                    name,
                    uri: content || doc.uri,
                    status,
                    classification,
                    privilege,
                    matterId: actualMatterId,
                    updatedAt: new Date()
                }
            })
        ]);

        // Explicit Audit Log for Versioning
        await prisma.auditLog.create({
            data: {
                action: 'DOCUMENT_VERSION_CREATED',
                userId: req.user?.id,
                matterId: doc.matterId,
                resourceId: id,
                details: `Vault Version ${nextVersionNumber} committed for artifact: ${name || doc.name}`,
            } as any
        });

        const updatedDoc = await prisma.document.findUnique({ where: { id } });
        res.json(updatedDoc);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk Update documents
router.patch('/bulk-update', authenticateToken, async (req, res) => {
    try {
        const { ids, data } = req.body;
        const tenantId = req.user?.tenantId;

        if (!ids || !Array.isArray(ids) || !data) {
            return res.status(400).json({ error: 'Invalid bulk update request' });
        }

        // Verify all documents belong to the user's tenant
        const count = await prisma.document.count({
            where: {
                id: { in: ids },
                matter: { tenantId: tenantId as string }
            }
        });

        if (count !== ids.length) {
            return res.status(403).json({ error: 'Unauthorized access to some records' });
        }

        // Perform update
        const updated = await prisma.document.updateMany({
            where: { id: { in: ids } },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });

        res.json({ success: true, count: updated.count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk Delete documents
router.post('/bulk-delete', authenticateToken, async (req, res) => {
    try {
        const { ids } = req.body;
        const tenantId = req.user?.tenantId;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Invalid bulk delete request' });
        }

        // Verify all documents belong to the user's tenant
        const count = await prisma.document.count({
            where: {
                id: { in: ids },
                matter: { tenantId: tenantId as string }
            }
        });

        if (count !== ids.length) {
            return res.status(403).json({ error: 'Unauthorized access to some records' });
        }

        // Perform delete
        await prisma.document.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ success: true, count: ids.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get document versions
router.get('/:id/versions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        if (doc.matter.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const versions = await prisma.documentVersion.findMany({
            where: { documentId: id },
            orderBy: { versionNumber: 'desc' },
            include: { author: { select: { name: true } } }
        });

        res.json(versions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get content for a specific version
router.get('/:id/versions/:versionId/content', authenticateToken, async (req, res) => {
    try {
        const { id, versionId } = req.params;
        const tenantId = req.user?.tenantId;

        const doc = await prisma.document.findUnique({
            where: { id },
            include: { matter: true }
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const version = await prisma.documentVersion.findUnique({
            where: { id: versionId }
        });

        if (!version || version.documentId !== id) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // 🛡️ [SECURITY] Audit historical version read
        await prisma.auditLog.create({
            data: {
                action: 'DOCUMENT_VERSION_CONTENT_READ',
                userId: req.user?.id,
                matterId: doc.matterId,
                resourceId: versionId,
                details: `Historical version ${version?.versionNumber} read for artifact: ${doc.name}`,
            } as any
        });

        // Simulating content retrieval from URI (enclave storage)
        const content = `[OFFICIAL VERSION ${version.versionNumber}]\n\nSource: ${version.uri}\nCreated by: ${req.user?.name}\n\n[Sovereign Content Placeholder]\nThis is the historical artifact content as it existed at version ${version.versionNumber}.`;

        res.json({ content });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
