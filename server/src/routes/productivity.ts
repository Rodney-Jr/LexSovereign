// v1.0.2 - Fixed lawyerId and analyzeLocalPolicy build errors
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { LexAIService } from '../services/LexAIService';

const router = Router();
const prisma = new PrismaClient();
const aiService = new LexAIService();

/**
 * GET /api/productivity/heatmap/:userId
 * Aggregates ActivityEntries over the last 90 days to visualize daily engagement.
 */
router.get('/heatmap/:userId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const tenantId = req.user?.tenantId;

        // Verify the target user belongs to the same tenant that is querying
        const targetUser = await prisma.user.findFirst({
            where: { id: userId, tenantId }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found in this tenant context.' });
        }

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const activities = await prisma.activityEntry.findMany({
            where: {
                actorId: userId,
                createdAt: {
                    gte: ninetyDaysAgo
                }
            },
            select: {
                id: true,
                type: true,
                createdAt: true,
                details: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by Date string (YYYY-MM-DD)
        const heatmapData = activities.reduce((acc, entry) => {
            const dateKey = entry.createdAt.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    count: 0,
                    activities: []
                };
            }
            acc[dateKey].count += 1;
            // Keep a sample of the most recent 3 activities for the tooltip
            if (acc[dateKey].activities.length < 3) {
                acc[dateKey].activities.push({
                    type: entry.type,
                    details: entry.details,
                    time: entry.createdAt.toLocaleTimeString()
                });
            }
            return acc;
        }, {} as Record<string, any>);

        return res.json({
            userId,
            heatmap: Object.values(heatmapData).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            totalActivities90d: activities.length
        });

    } catch (error) {
        console.error("Heatmap aggregate error:", error);
        return res.status(500).json({ error: 'Failed to aggregate activity heatmap.' });
    }
});


/**
 * GET /api/productivity/utilization/:userId
 * Calculates the percentage of billable vs total working hours for a user.
 * Optional query ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get('/utilization/:userId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const tenantId = req.user?.tenantId;
        const { startDate, endDate } = req.query;

        // Default to current month if no dates provided
        const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate as string) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

        const timeEntries = await prisma.timeEntry.findMany({
            where: {
                userId: userId,
                startTime: {
                    gte: start,
                    lte: end
                },
                // Assume that any entry that makes it to the db is 'real' work for tracking purposes, 
                // but we segment out isBillable for the utilization math
            }
        });

        const totalTrackedMinutes = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
        const billableMinutes = timeEntries.filter(e => e.isBillable).reduce((sum, e) => sum + e.durationMinutes, 0);
        const nonBillableMinutes = totalTrackedMinutes - billableMinutes;

        // Simple calculation: Target 160 hours per month = 9600 minutes.
        // We can make this dynamic if the Target is stored on the User record.
        const targetMonthlyMinutes = 9600;

        // Utilization = Billable / Target Working Hours
        const utilizationRate = targetMonthlyMinutes > 0 ? (billableMinutes / targetMonthlyMinutes) * 100 : 0;

        return res.json({
            userId,
            period: { start, end },
            metrics: {
                totalTrackedHours: totalTrackedMinutes / 60,
                billableHours: billableMinutes / 60,
                nonBillableHours: nonBillableMinutes / 60,
                utilizationRatePercentage: Math.round(utilizationRate * 10) / 10,
                targetHours: targetMonthlyMinutes / 60
            }
        });
    } catch (error) {
        console.error("Utilization aggregate error:", error);
        return res.status(500).json({ error: 'Failed to calculate utilization.' });
    }
});

/**
 * GET /api/productivity/ai-timesheet-suggestions
 * Detects "phantom" interactions from ActivityEntries that don't have a matching TimeEntry
 * and uses AI to guess the block size and draft a suggestion.
 */
router.get('/ai-timesheet-suggestions/:userId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Find activity today that was produced by this user
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = await prisma.activityEntry.findMany({
            where: {
                actorId: userId,
                createdAt: { gte: today }
            },
            take: 20, // analyze the last 20 actions today
            orderBy: { createdAt: 'desc' }
        });

        // Quick fail if they didn't do anything today
        if (activities.length === 0) {
            return res.json({ suggestions: [] });
        }

        // We prepare a prompt for the AI to infer blocks of time.
        // Normally, we would diff against their existing TimeEntries, but for MVP we will just
        // ask the AI to find the biggest gap of activity.

        const activityLogStr = activities.map(a => `[${a.createdAt.toISOString()}] (Matter: ${a.matterId}) ${a.type}: ${a.details}`).join('\n');

        const prompt = `
            You are a Legal Practice Management AI assistant.
            Review the following system interaction logs from an attorney today.
            Your job is to identify a "phantom" block of work. For instance, if you see them upload 5 pleadings to Matter A, suggest a 1-hour Drafting block.
            If you see them change the workflow state for Matter B, suggest a 0.5-hour Review block.
            
            Logs:
            ${activityLogStr}

            Respond strictly in valid JSON format matching this array schema:
            [
              {
                "matterId": "string (the most frequent matter id seen in the cluster of logs)",
                "activityType": "Drafting | Research | Review | Client Meeting",
                "durationMinutes": number (e.g. 30, 60, 90),
                "description": "A professional timesheet description (e.g. 'Drafted initial pleadings and uploaded to matter vault')",
                "confidence": "High | Medium | Low"
              }
            ]
        `;

        try {
            // Using Anthropic logic or fallback 
            // The facade should ideally have a raw JSON method, but we can use string extraction
            const aiResponseText = await aiService.analyzeLocalPolicy(prompt); // Re-using a method that connects to an LLM provider and returns text.

            // Extract JSON
            const jsonStrMatch = aiResponseText.match(/\[[\s\S]*\]/);
            if (jsonStrMatch) {
                const suggestions = JSON.parse(jsonStrMatch[0]);
                return res.json({ suggestions });
            } else {
                return res.json({ suggestions: [] });
            }

        } catch (aiError) {
            console.error("AI timesheet suggestion failed:", aiError);
            return res.json({ suggestions: [], _error: "AI parser failed" });
        }

    } catch (error) {
        console.error("Timesheet suggestion error:", error);
        return res.status(500).json({ error: 'Failed to generate suggestions.' });
    }
});

export default router;
