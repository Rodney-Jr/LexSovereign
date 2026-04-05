import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { sovereignGuard } from '../middleware/sovereignGuard';

const router = express.Router();

export interface InternalUser {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// ASSETS
// ---------------------------------------------------------------------------
router.get('/assets', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const assets = await prisma.firmAsset.findMany({
            where: { tenantId },
            include: { assignedTo: true },
            orderBy: { createdAt: 'desc' }
        });

        // Map assignedTo user string for frontend
        const mappedAssets = assets.map(a => ({
            ...a,
            assignedTo: a.assignedTo ? a.assignedTo.name : undefined
        }));

        res.json(mappedAssets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/assets', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { name, serialNumber, category, status, purchaseDate, notes } = req.body;

        const asset = await prisma.firmAsset.create({
            data: {
                tenantId,
                name,
                serialNumber,
                category,
                status,
                purchaseDate: new Date(purchaseDate || new Date()),
                notes
            }
        });
        res.json(asset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/assets/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { status, assignedToId, notes } = req.body;

        const asset = await prisma.firmAsset.update({
            where: { id: req.params.id, tenantId },
            data: { status, assignedToId, notes }
        });
        res.json(asset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// EXPENSES
// ---------------------------------------------------------------------------
router.get('/expenses', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const expenses = await prisma.expense.findMany({
            where: { tenantId },
            orderBy: { expenseDate: 'desc' }
        });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/expenses', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { description, amount, category, status, expenseDate, notes, type } = req.body;

        const expense = await prisma.expense.create({
            data: {
                tenantId,
                description,
                amount: parseFloat(amount),
                category,
                status,
                expenseDate: new Date(expenseDate || new Date()),
                notes,
                type: type || 'UTILITY'
            }
        });
        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/expenses/:id/status', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { status } = req.body;

        const expense = await prisma.expense.update({
            where: { id: req.params.id, tenantId },
            data: { status }
        });
        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// HR / STAFF DIRECTORY (Simplified map to users for mock compat)
// ---------------------------------------------------------------------------
router.get('/staff', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const users = await prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                roleString: true,
                departmentId: true,
                isActive: true
            }
        });

        // Map it to look like the mock StaffMember frontend object
        // The real implementation needs actual department names, so we return generic.
        const mapped = users.map(u => ({
            id: u.id,
            name: u.name,
            role: u.roleString,
            department: u.departmentId || 'Operations', // Fallback
            status: u.isActive ? 'Active' : 'Suspended',
            joinDate: '2023-01-01', // Fallback, would be createdAt
            email: u.email
        }));

        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/payroll', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const users = await prisma.user.findMany({
            where: { tenantId },
            include: {
                salaryRecords: {
                    orderBy: { effectiveFrom: 'desc' },
                    take: 1
                }
            }
        });

        const payrollData = users.map(u => ({
            id: u.id,
            name: u.name,
            role: u.roleString,
            salary: u.salaryRecords[0]?.baseSalary || 0,
            lastUpdated: u.salaryRecords[0]?.effectiveFrom.toISOString().split('T')[0] || 'N/A'
        }));

        res.json(payrollData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// LEAVES / ABSENCES
// ---------------------------------------------------------------------------
router.get('/leaves', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const leaves = await prisma.leaveRecord.findMany({
            where: { tenantId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = leaves.map(l => ({
            id: l.id,
            staffName: l.user.name,
            type: l.type,
            startDate: l.startDate.toISOString().split('T')[0],
            endDate: l.endDate.toISOString().split('T')[0],
            status: l.status
        }));

        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/leaves', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { userId, type, startDate, endDate, reason } = req.body;

        const leave = await prisma.leaveRecord.create({
            data: {
                tenantId,
                userId,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'Pending'
            }
        });
        res.json(leave);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/leaves/:id/status', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { status } = req.body;

        const leave = await prisma.leaveRecord.update({
            where: { id: req.params.id, tenantId },
            data: { status }
        });
        res.json(leave);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// CANDIDATES
// ---------------------------------------------------------------------------
router.get('/recruitment/candidates', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const candidates = await prisma.candidate.findMany({
            where: { tenantId },
            orderBy: { appliedOn: 'desc' }
        });

        const mapped = candidates.map(c => ({
            ...c,
            appliedOn: c.appliedOn.toISOString().split('T')[0]
        }));
        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/recruitment/candidates', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { name, email, role, status } = req.body;

        const candidate = await prisma.candidate.create({
            data: { tenantId, name, email, role, status }
        });
        res.json(candidate);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/recruitment/candidates/:id/stage', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: 'status is required' });

        const updated = await prisma.candidate.update({
            where: { id: req.params.id, tenantId },
            data: { status }
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// CLE / COMPLIANCE
// ---------------------------------------------------------------------------
router.get('/compliance/cle', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        // Mock-compatible aggregate format
        const cleRecords = await prisma.cLERecord.findMany({
            where: { tenantId },
            include: { user: true }
        });

        // Group by user
        const map: any = {};
        cleRecords.forEach(c => {
            if (!map[c.userId]) {
                map[c.userId] = {
                    id: c.userId,
                    staffName: c.user.name,
                    completedCredits: 0,
                    requiredCredits: 12, // Assume 12 for all for mock compatibility
                    deadline: c.deadline ? c.deadline.toISOString().split('T')[0] : '2026-12-31'
                };
            }
            map[c.userId].completedCredits += c.credits;
        });

        // If there are no users, return generic. Usually we'd seed or join users.
        res.json(Object.values(map));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/compliance/cle', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { userId, course, credits, date, deadline } = req.body;

        const cle = await prisma.cLERecord.create({
            data: {
                tenantId,
                userId,
                course,
                credits: parseInt(credits),
                date: new Date(date),
                deadline: deadline ? new Date(deadline) : null
            }
        });
        res.json(cle);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// ONBOARDING
// ---------------------------------------------------------------------------
router.get('/onboarding', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const items = await prisma.onboardingItem.findMany({
            where: { tenantId }
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/onboarding/:id/toggle', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const item = await prisma.onboardingItem.findUnique({ where: { id: req.params.id, tenantId } });
        if (!item) return res.status(404).json({ error: 'Not found' });

        const updated = await prisma.onboardingItem.update({
            where: { id: req.params.id },
            data: { isCompleted: !item.isCompleted }
        });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/staff/:id/status', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { status } = req.body; // 'Active' | 'Suspended'

        if (!status) return res.status(400).json({ error: 'status is required' });

        const isActive = status === 'Active';
        const updated = await prisma.user.update({
            where: { id: req.params.id, tenantId },
            data: { isActive }
        });
        res.json({ id: updated.id, status: updated.isActive ? 'Active' : 'Suspended' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// STAFF DOSSIER & INDIVIDUAL RECORDS
// ---------------------------------------------------------------------------
router.get('/staff/:id/dossier', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { id } = req.params;

        const isGlobalAdmin = !tenantId;
        const tenantFilter = isGlobalAdmin ? {} : { tenantId: tenantId as string };

        const [user, assets, leaves, cle, salary, appraisals] = await Promise.all([
            prisma.user.findFirst({
                where: { id, ...tenantFilter },
                select: { id: true, name: true, email: true, roleString: true, departmentId: true, isActive: true, createdAt: true }
            }),
            prisma.firmAsset.findMany({ where: { assignedToId: id, ...tenantFilter } }),
            prisma.leaveRecord.findMany({ where: { userId: id, ...tenantFilter } }),
            prisma.cLERecord.findMany({ where: { userId: id, ...tenantFilter } }),
            prisma.salaryRecord.findFirst({
                where: { userId: id, ...tenantFilter },
                orderBy: { effectiveFrom: 'desc' }
            }),
            prisma.performanceAppraisal.findMany({
                where: { userId: id, ...tenantFilter },
                include: { reviewer: true },
                orderBy: { date: 'desc' }
            })
        ]);

        if (!user) return res.status(404).json({ error: 'Staff member not found' });

        res.json({
            id: user.id,
            name: user.name,
            role: user.roleString,
            department: user.departmentId || 'Operations',
            email: user.email,
            startDate: user.createdAt.toISOString().split('T')[0],
            status: user.isActive ? 'Active' : 'Suspended',
            annualLeaveTotal: 25, // Mock default or fetch from user metadata
            annualLeaveUsed: leaves.length * 2, // Dummy calc
            sickDaysUsed: 1,
            cleRequired: 12,
            cleEarned: cle.reduce((s, c) => s + c.credits, 0),
            salary: salary?.baseSalary || 0,
            bankAccount: salary?.bankAccount || 'N/A',
            hardware: assets.map(a => ({ id: a.id, type: a.category, name: a.name, status: a.status })),
            appraisals: appraisals.map(a => ({
                date: a.date.toISOString().split('T')[0],
                rating: a.rating,
                reviewer: a.reviewer.name,
                notes: a.notes
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/salary', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const { userId, baseSalary, bankAccount, effectiveFrom } = req.body;
        const salary = await prisma.salaryRecord.create({
            data: {
                tenantId,
                userId,
                baseSalary: parseFloat(baseSalary),
                bankAccount,
                effectiveFrom: new Date(effectiveFrom || new Date())
            }
        });
        res.json(salary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/appraisals', async (req: Request, res: Response) => {
    try {
        const tenantId = (req.user as InternalUser).tenantId;
        const reviewerId = (req.user as InternalUser).id;
        const { userId, rating, notes, date } = req.body;
        const appraisal = await prisma.performanceAppraisal.create({
            data: {
                tenantId,
                userId,
                reviewerId,
                rating,
                notes,
                date: new Date(date || new Date())
            }
        });
        res.json(appraisal);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// SELF-SERVICE DOSSIER
// ---------------------------------------------------------------------------
router.get('/my-dossier', async (req: Request, res: Response) => {
    try {
        const user = req.user as InternalUser;
        const tenantId = user.tenantId;
        const id = user.id;

        const isGlobalAdmin = !tenantId;
        const tenantFilter = isGlobalAdmin ? {} : { tenantId: tenantId as string };

        const [dbUser, assets, leaves, cle, salary, appraisals] = await Promise.all([
            prisma.user.findFirst({
                where: { id, ...tenantFilter },
                select: { id: true, name: true, email: true, roleString: true, departmentId: true, isActive: true, createdAt: true }
            }),
            prisma.firmAsset.findMany({ where: { assignedToId: id, ...tenantFilter } }),
            prisma.leaveRecord.findMany({ where: { userId: id, ...tenantFilter } }),
            prisma.cLERecord.findMany({ where: { userId: id, ...tenantFilter } }),
            prisma.salaryRecord.findFirst({
                where: { userId: id, ...tenantFilter },
                orderBy: { effectiveFrom: 'desc' }
            }),
            prisma.performanceAppraisal.findMany({
                where: { userId: id, ...tenantFilter },
                include: { reviewer: true },
                orderBy: { date: 'desc' }
            })
        ]);

        if (!dbUser) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: dbUser.id,
            name: dbUser.name,
            role: dbUser.roleString,
            department: dbUser.departmentId || 'Operations',
            email: dbUser.email,
            startDate: dbUser.createdAt.toISOString().split('T')[0],
            status: dbUser.isActive ? 'Active' : 'Suspended',
            annualLeaveTotal: 25,
            annualLeaveUsed: leaves.length * 2,
            sickDaysUsed: 1,
            cleRequired: 12,
            cleEarned: cle.reduce((s, c) => s + c.credits, 0),
            salary: salary?.baseSalary || 0,
            bankAccount: salary?.bankAccount || 'N/A',
            hardware: assets.map(a => ({ id: a.id, type: a.category, name: a.name, status: a.status })),
            appraisals: appraisals.map(a => ({
                date: a.date.toISOString().split('T')[0],
                rating: a.rating,
                reviewer: a.reviewer.name,
                notes: a.notes
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/my-profile', async (req: Request, res: Response) => {
    try {
        const user = req.user as InternalUser;
        const { name, email, phone, bankAccount } = req.body;

        // Update User Model (Basic Fields)
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name, email }
        });

        // Update Phone/Contact in metadata if we had a profile model, 
        // but for now, we'll just handle basic names.
        // Update Salary Record for Bank Account (Since dossier reads from there)
        if (bankAccount) {
            const latestSalary = await prisma.salaryRecord.findFirst({
                where: { userId: user.id },
                orderBy: { effectiveFrom: 'desc' }
            });

            if (latestSalary) {
                await prisma.salaryRecord.update({
                    where: { id: latestSalary.id },
                    data: { bankAccount }
                });
            } else {
                // Create a shell salary record just for the bank account if none exists
                await prisma.salaryRecord.create({
                    data: {
                        userId: user.id,
                        tenantId: user.tenantId,
                        baseSalary: 0,
                        bankAccount,
                        effectiveFrom: new Date()
                    }
                });
            }
        }

        res.json({ success: true, user: updatedUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
