import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateAgentKey } from '../middleware/agentAuth';
import { ComplianceService } from '../services/ComplianceService';
import { saveDocumentContent } from '../utils/fileStorage';
import { prisma } from '../db';
import fs from 'fs';

const router = Router();

// Ensure raw upload directory exists
const UPLOADS_DIR = path.join(process.cwd(), '../uploads/ingest_agent');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Temporary storage for incoming agent files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Obfuscate file name during transit
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size for agent sync
});

/**
 * POST /api/agent/upload
 * Secured by authenticateAgentKey (x-api-key)
 * Accepts a multipart/form-data payload with the file.
 */
router.post('/upload', authenticateAgentKey, upload.single('document'), async (req, res) => {
    try {
        const file = req.file;
        const tenantId = req.agentContext?.tenantId;
        const matterId = req.body.matterId as string | undefined; // Optional auto-classification

        if (!tenantId) {
            return res.status(403).json({ error: 'Tenant context lost.' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No document file provided.' });
        }

        console.log(`[AgentSync] Received file: ${file.originalname} for Tenant: ${tenantId}`);

        let actualMatterId = matterId;

        // Verify or create the General Enclave matter if none provided
        if (matterId) {
            const matter = await prisma.matter.findUnique({
                where: { id: matterId },
                include: { tenant: true }
            });
            if (!matter || matter.tenantId !== tenantId) {
                console.warn(`[AgentSync] Provided Matter ${matterId} not found or doesn't belong to tenant ${tenantId}. Reverting to General Matter.`);
                actualMatterId = undefined; // Trigger default creation below
            }
        }

        if (!actualMatterId) {
            let generalMatter = await prisma.matter.findFirst({
                where: { tenantId, name: 'General Enclave Matters' },
                include: { tenant: true }
            });

            if (!generalMatter) {
                console.log(`[AgentSync] Provisioning missing General Enclave for agent sync on tenant: ${tenantId}`);
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
                    },
                    include: { tenant: true }
                });
            }
            actualMatterId = generalMatter.id;
        }

        const matter = await prisma.matter.findUnique({
            where: { id: actualMatterId },
            include: { tenant: true }
        });

        // Load the file into memory buffer for core services
        const fileBuffer = fs.readFileSync(file.path);

        const encryptionMode = matter!.tenant.encryptionMode;
        let isEncrypted = false;
        let encryptionIV: string | undefined;
        let encryptionKeyId: string | undefined;

        if (encryptionMode === 'BYOK') {
            const { randomBytes } = await import('crypto');
            isEncrypted = true;
            encryptionIV = randomBytes(12).toString('base64');
            encryptionKeyId = `tenant-key-${tenantId}`;
        }

        // Save Binary Content to S3/Disk
        const relativePath = await saveDocumentContent(
            matter!.tenant as any,
            actualMatterId,
            file.originalname,
            fileBuffer,
            isEncrypted ? { keyId: encryptionKeyId!, algorithm: 'AES-256-GCM', iv: encryptionIV! } : undefined
        );

        const uri = `file://${relativePath}`;

        // Incept Sovereign AI Compliance Scrub
        const complianceData = await ComplianceService.analyzeFile(
            fileBuffer, 
            file.originalname, 
            file.mimetype || 'application/octet-stream', 
            matter!.tenant.primaryRegion || 'GH_ACC_1'
        );

        const doc = await prisma.document.create({
            data: {
                name: file.originalname,
                uri,
                jurisdiction: matter!.tenant.jurisdiction || 'GH_ACC_1',
                classification: 'Confidential', // Default classification for agent syncs
                privilege: 'INTERNAL',
                residencyStatus: 'LOCAL_PINNED',
                physicalRegion: matter!.tenant.jurisdiction || 'GH_ACC_1',
                tenantId,
                matterId: actualMatterId,
                isEncrypted,
                encryptionIV,
                encryptionKeyId,
                fileSize: BigInt(file.size),
                attributes: {
                    type: file.mimetype || 'application/octet-stream',
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    originalName: file.originalname,
                    complianceScore: complianceData.complianceScore,
                    piiCount: complianceData.piiCount,
                    riskLevel: complianceData.riskLevel,
                    issues: complianceData.issues,
                    source: 'AGENT_SYNC'
                }
            }
        });

        // Create Initial Version
        await prisma.documentVersion.create({
            data: {
                documentId: doc.id,
                tenantId,
                versionNumber: 1,
                uri: doc.uri,
                authorId: null, // Agent uploaded it
                changeSummary: 'Initial upload via Local Agent',
                isCurrent: true
            }
        });

        // Delete the temporary file from disk
        fs.unlink(file.path, (err) => {
            if (err) console.error(`[AgentSync] Failed to cleanup temp file ${file.path}:`, err);
        });

        res.status(200).json({
            success: true,
            message: 'Document successfully ingested to Vault',
            documentId: doc.id
        });

    } catch (error: any) {
        console.error('[AgentSync] Ingestion error:', error);
        
        // Clean up file on error
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }

        res.status(500).json({ error: 'Failed to process agent upload', details: error.message });
    }
});

export default router;
