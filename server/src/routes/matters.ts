import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { PolicyEngine } from '../services/policyEngine';
import { CapacityService } from '../services/capacityService';
import { AuditService } from '../services/auditService';
import multer from 'multer';
import { saveDocumentContent } from '../utils/fileStorage';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get all matters (Scoped by Departmental Separation)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.tenantId) {
            return res.status(400).json({ error: 'User context invalid' });
        }

        // 1. Fetch Tenant Mode & User Department
        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            select: { separationMode: true }
        });

        const separationMode = tenant?.separationMode || 'OPEN';
        let whereClause: any = { tenantId: user.tenantId }; // Filter by Tenant automatically handled by middleware, but good for explicit clarity

        // 2. Apply Separation Logic
        // Apply Separation Logic. Only TENANT_ADMIN bypasses departmental separation for their own tenant.
        const isAdmin = user.role === 'TENANT_ADMIN';

        if (user.role === 'CLIENT') {
            // Clients see matters associated with their name/organization
            // In this demo, we match the client string in the matter
            whereClause = {
                ...whereClause,
                OR: [
                    { client: { contains: user.name, mode: 'insensitive' } },
                    { client: { contains: user.name.split('(').pop()?.replace(')', '').trim() || '', mode: 'insensitive' } }
                ]
            };
        } else if (!isAdmin) {
            if (separationMode === 'STRICT') {
                // Only see matters YOU are assigned to
                whereClause = {
                    ...whereClause,
                    internalCounselId: user.id
                };
            } else if (separationMode === 'DEPARTMENTAL') {
                // See matters in YOUR department OR assigned to you
                // If user has no department, fall back to strict (safe default)
                if (user.department) {
                    whereClause = {
                        ...whereClause,
                        OR: [
                            { department: user.department },
                            { internalCounselId: user.id } // Always see your own work
                        ]
                    };
                } else {
                    whereClause = {
                        ...whereClause,
                        internalCounselId: user.id
                    };
                }
            }
            // If OPEN, no extra filter (Middleware handles Tenant scope)
        }

        const matters = await prisma.matter.findMany({
            where: whereClause,
            include: {
                tenant: true,
                internalCounsel: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(matters);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Validate capacity for a practitioner before matter inception
router.get('/validate-capacity', authenticateToken, async (req, res) => {
    try {
        const { userId, riskLevel, region, complexityWeight } = req.query;

        if (!userId) {
            res.status(400).json({ error: 'Missing userId for capacity validation' });
            return;
        }

        const validation = await CapacityService.validateAssignment(userId as string, {
            riskLevel: (riskLevel as string) || 'LOW',
            region: region as string,
            complexityWeight: complexityWeight ? parseFloat(complexityWeight as string) : undefined
        });

        res.json(validation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Perform conflict check for potential collisions
router.post('/conflict-check', authenticateToken, async (req, res) => {
    try {
        const { searchTerm } = req.body;

        if (!searchTerm || searchTerm.length < 3) {
            res.status(400).json({ error: 'Search term too short for conflict check' });
            return;
        }

        // Search for matters or clients with similar names
        const collisions = await prisma.matter.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { client: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                client: true,
                status: true
            },
            take: 5
        });

        if (collisions.length > 0) {
            res.json({
                result: 'COLLISION',
                collisions: collisions.map(c => `${c.name} (${c.client}) - Status: ${c.status}`)
            });
        } else {
            res.json({ result: 'CLEAN' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new matter
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, client, type, region, internalCounselId, tenantId, description, complexityWeight, overrideJustification } = req.body;

        // Basic validation
        if (!name || !client || !type || !tenantId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Capacity & Eligibility Lock (Only if counsel is provided during creation)
        if (internalCounselId) {
            const validation = await CapacityService.validateAssignment(internalCounselId, {
                riskLevel: 'LOW',
                region,
                complexityWeight
            });

            if (!validation.allowed) {
                if (validation.severity === 'OVERRIDE' && overrideJustification) {
                    await AuditService.log(
                        'CAPACITY_OVERRIDE',
                        req.user?.id || null,
                        name,
                        `Manual override for assignment to ${internalCounselId}. Reason: ${overrideJustification}`
                    );
                } else {
                    res.status(403).json({
                        error: validation.reason,
                        severity: validation.severity,
                        details: validation.details
                    });
                    return;
                }
            }
        }

        // Fetch counsel to get their department (If assignment made)
        let departmentId = undefined;
        if (internalCounselId) {
            const counsel = await prisma.user.findUnique({
                where: { id: internalCounselId },
                select: { departmentId: true }
            });
            departmentId = counsel?.departmentId || undefined;
        }

        const matter = await prisma.matter.create({
            data: {
                name,
                client,
                type,
                status: 'OPEN',
                riskLevel: 'LOW',
                description: description || '',
                complexityWeight: complexityWeight || 5.0,
                internalCounselId: internalCounselId || null,
                tenantId,
                departmentId
            }
        });

        // [DEMO ENHANCEMENT] Automated Localized Checklist for Ghana Property
        if (type === 'Property/Commercial') {
            const checklist = [
                { title: 'Lands Commission Search', description: 'Public & Vested Lands Search' },
                { title: 'Land Valuation Division', description: 'Stamp Duty Assessment' },
                { title: 'Survey & Mapping Division', description: 'Plan Verification' },
                { title: 'Land Title Registry Search', description: 'Verify current proprietorship' },
                { title: 'Stool/Traditional Authority Verification', description: 'Confirm customary land status' }
            ];

            await prisma.task.createMany({
                data: checklist.map((t, idx) => ({
                    ...t,
                    matterId: matter.id,
                    tenantId: tenantId,
                    priority: 'HIGH',
                    status: 'PENDING',
                    isAutoGenerated: true,
                    dueDate: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000)
                }))
            });
        }

        res.json(matter);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Assign or self-assign a counsel to an existing matter
router.patch('/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { internalCounselId, overrideJustification } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Target counsel can be provided in body, or fall back to current user (Self-assign)
        const targetCounselId = internalCounselId || user.id;

        // Perform capacity check for the assignment
        const validation = await CapacityService.validateAssignment(targetCounselId, {
            riskLevel: 'LOW',
            complexityWeight: 5.0 // Default for post-assignment
        });

        if (!validation.allowed) {
            if (validation.severity === 'OVERRIDE' && overrideJustification) {
                await AuditService.log(
                    'CAPACITY_OVERRIDE_POST_ASSIGN',
                    user.id,
                    id,
                    `Manual override during post-assignment to ${targetCounselId}. Reason: ${overrideJustification}`
                );
            } else {
                return res.status(403).json({
                    error: validation.reason,
                    severity: validation.severity,
                    details: validation.details
                });
            }
        }

        const counsel = await prisma.user.findUnique({
            where: { id: targetCounselId },
            select: { departmentId: true }
        });

        const updated = await prisma.matter.update({
            where: { id, tenantId: user.tenantId },
            data: {
                internalCounselId: targetCounselId,
                departmentId: counsel?.departmentId || undefined
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// Update a matter (With Policy Check)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, client, type, internalCounsel, status, riskLevel, description, complexityWeight, overrideJustification } = req.body;
        const user = req.user;

        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 1. Fetch current matter state
        const currentMatter = await prisma.matter.findUnique({ where: { id } });
        if (!currentMatter) {
            return res.status(404).json({ error: 'Matter not found' });
        }

        // 2. Capacity & Eligibility Lock (If counsel changes or risk/weight changes)
        if (internalCounsel !== currentMatter.internalCounselId || riskLevel !== currentMatter.riskLevel || complexityWeight !== currentMatter.complexityWeight) {
            const validation = await CapacityService.validateAssignment(internalCounsel || currentMatter.internalCounselId, {
                riskLevel: riskLevel || currentMatter.riskLevel,
                complexityWeight: complexityWeight || currentMatter.complexityWeight
            });

            if (!validation.allowed) {
                if (validation.severity === 'OVERRIDE' && overrideJustification) {
                    await AuditService.log(
                        'CAPACITY_OVERRIDE_UPDATE',
                        user.id,
                        id,
                        `Manual override during update for matter ${id}. Reason: ${overrideJustification}`
                    );
                } else {
                    return res.status(403).json({
                        error: validation.reason,
                        severity: validation.severity,
                        details: validation.details
                    });
                }
            }
        }

        // 3. Policy Check: High Risk Updates
        if (riskLevel === 'HIGH' || currentMatter.riskLevel === 'HIGH') {
            const policyResult = await PolicyEngine.evaluate(
                user.id,
                user.attributes || {},
                'MATTER',
                { ...currentMatter, riskLevel },
                'UPDATE_HIGH_RISK',
                user.tenantId
            );

            if (!policyResult.allowed) {
                return res.status(403).json({
                    error: `Policy Restriction: ${policyResult.reason || 'High Risk Matters require elevated approval.'}`
                });
            }
        }

        // 4. Dual Approval for Closing
        if (status === 'CLOSED' && currentMatter.status !== 'CLOSED') {
            const closePolicy = await PolicyEngine.evaluate(
                user.id,
                user.attributes || {},
                'MATTER',
                currentMatter,
                'CLOSE_MATTER',
                user.tenantId
            );
            if (!closePolicy.allowed) {
                return res.status(403).json({ error: 'Closure denied. Requires Partner/GC approval.' });
            }
        }

        const updated = await prisma.matter.update({
            where: { id },
            data: {
                name,
                client,
                type,
                internalCounselId: internalCounsel,
                status,
                riskLevel,
                complexityWeight,
                description
            }
        });

        return res.json(updated);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// GET intelligence for a specific matter (Team, Velocity, Ledger)
router.get('/:id/intelligence', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });
        }

        const matter = await prisma.matter.findUnique({
            where: { id },
            include: {
                internalCounsel: true,
                timeEntries: {
                    include: { user: true },
                    orderBy: { startTime: 'desc' }
                },
                documents: true,
                collaborationMessages: {
                    include: { author: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!matter || matter.tenantId !== tenantId) {
            return res.status(404).json({ error: 'Matter not found' });
        }



        // Calculate Velocity Metrics
        let avgCycleTime = 0;
        if (matter.documents.length > 0) {
            const cycleTimes = matter.documents.map(d =>
                new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()
            );
            avgCycleTime = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
        }

        // Fetch Legal Team peers (everyone in the same department/tenant)
        const teamPeers = await prisma.user.findMany({
            where: {
                tenantId,
                departmentId: matter.departmentId
            },
            select: {
                id: true,
                name: true,
                roleString: true
            },
            take: 5
        });

        res.json({
            matter,
            metrics: {
                docCycleTime: avgCycleTime, // in ms
                totalHours: matter.timeEntries.reduce((acc, te) => acc + te.durationMinutes, 0) / 60
            },
            team: teamPeers
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET collaboration notes
router.get('/:id/notes', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const notes = await prisma.collaborationMessage.findMany({
            where: { matterId: id },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });

        // Mark incoming messages as read for this user
        // (Messages authored by others that are currently marked as unread)
        if (userId) {
            await prisma.collaborationMessage.updateMany({
                where: {
                    matterId: id,
                    authorId: { not: userId },
                    isRead: false
                },
                data: { isRead: true }
            });
        }

        res.json(notes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH mark specific message as read
router.patch('/:id/notes/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; // matterId
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await prisma.collaborationMessage.updateMany({
            where: {
                matterId: id,
                authorId: { not: userId },
                isRead: false
            },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST collaboration note
router.post('/:id/notes', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user?.id;
        const tenantId = req.user?.tenantId;

        if (!userId || !tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let attachmentUrl = null;
        let attachmentName = null;

        if (req.file) {
            attachmentName = req.file.originalname;
            const relativePath = await saveDocumentContent(
                tenantId,
                id, // Use matterId for folder structure
                `chat_${Date.now()}_${attachmentName}`,
                req.file.buffer
            );
            attachmentUrl = `/api/attachments/${relativePath}`;
        }

        const note = await prisma.collaborationMessage.create({
            data: {
                text: text || '', // Allow empty text if file is present
                matterId: id,
                tenantId: tenantId,
                authorId: userId,
                attachmentUrl,
                attachmentName
            },
            include: { author: true }
        });

        res.json(note);
    } catch (error: any) {
        console.error('Note creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST a time entry to the ledger
router.post('/:id/time-entries', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { description, durationMinutes, startTime, isBillable } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const entry = await prisma.timeEntry.create({
            data: {
                description,
                durationMinutes,
                startTime: new Date(startTime),
                isBillable: isBillable ?? true,
                matterId: id,
                tenantId: req.user!.tenantId,
                userId
            }
        });

        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
