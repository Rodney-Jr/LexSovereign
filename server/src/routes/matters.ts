import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { PolicyEngine } from '../services/policyEngine';
import { CapacityService } from '../services/capacityService';
import { AuditService } from '../services/auditService';

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
        // GLOBAL_ADMIN and TENANT_ADMIN might bypass? For now, apply to all to be safe, or check role.
        const isAdmin = user.role === 'GLOBAL_ADMIN' || user.role === 'TENANT_ADMIN';

        if (!isAdmin) {
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
        if (!name || !client || !type || !internalCounselId || !tenantId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Capacity & Eligibility Lock
        const validation = await CapacityService.validateAssignment(internalCounselId, {
            riskLevel: 'LOW',
            region,
            complexityWeight
        });

        if (!validation.allowed) {
            if (validation.severity === 'OVERRIDE' && overrideJustification) {
                // Log the override
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

        // Fetch counsel to get their department
        const counsel = await prisma.user.findUnique({
            where: { id: internalCounselId },
            select: { department: true }
        });

        const matter = await prisma.matter.create({
            data: {
                name,
                client,
                type,
                status: 'OPEN',
                riskLevel: 'LOW',
                description: description || '',
                complexityWeight: complexityWeight || 5.0,
                internalCounselId,
                tenantId,
                department: counsel?.department // Auto-inherit department from assignee
            }
        });

        res.json(matter);
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

export default router;
