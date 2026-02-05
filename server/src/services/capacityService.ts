import { prisma } from '../db';

export class CapacityService {
    /**
     * Complexity weight mapping based on risk levels.
     */
    static readonly RISK_WEIGHTS: Record<string, number> = {
        'LOW': 2.0,
        'MEDIUM': 5.0,
        'HIGH': 10.0,
        'CRITICAL': 20.0
    };

    /**
     * Calculates the current utilization for a practitioner across all active matters.
     */
    static async calculateUtilization(userId: string): Promise<number> {
        const activeMatters = await prisma.matter.findMany({
            where: {
                internalCounselId: userId,
                status: { not: 'CLOSED' }
            }
        });

        // Use stored complexityWeight or fallback to risk-level mapping
        return activeMatters.reduce((acc, matter) => {
            const weight = matter.complexityWeight || this.RISK_WEIGHTS[matter.riskLevel] || 5.0;
            return acc + weight;
        }, 0);
    }

    /**
     * Validates if a practitioner can be assigned to a specific matter.
     * Returns a status object with allowed flag and potential reasons.
     */
    static async validateAssignment(userId: string, matterData: { riskLevel: string, region?: string, complexityWeight?: number }) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user) {
            return { allowed: false, reason: 'Practitioner not found', severity: 'BLOCK' };
        }

        // 1. Jurisdiction Check
        const jurisdictionPins = (user.jurisdictionPins as string[]) || [];
        if (matterData.region && jurisdictionPins.length > 0 && !jurisdictionPins.includes(matterData.region)) {
            return {
                allowed: false,
                reason: `Practitioner is not pinned to the required jurisdiction: ${matterData.region}`,
                severity: 'BLOCK'
            };
        }

        // 2. Credential Check (Mock logic for MVP)
        const credentials = (user.credentials as any[]) || [];
        const expired = credentials.some(c => c.expiresAt && new Date(c.expiresAt) < new Date());
        if (expired) {
            return {
                allowed: false,
                reason: 'Practitioner has expired credentials on file.',
                severity: 'BLOCK'
            };
        }

        // 3. Capacity Check
        const currentUtilization = await this.calculateUtilization(userId);
        const matterWeight = matterData.complexityWeight || this.RISK_WEIGHTS[matterData.riskLevel] || 5.0;
        const projectedUtilization = currentUtilization + matterWeight;
        const capacityLimit = user.maxWeeklyHours || 40.0;

        if (projectedUtilization > capacityLimit) {
            return {
                allowed: false,
                reason: `Assignment would exceed capacity: ${projectedUtilization.toFixed(1)}h / ${capacityLimit}h (Critical Overload)`,
                severity: 'OVERRIDE',
                details: { current: currentUtilization, project: projectedUtilization, limit: capacityLimit }
            };
        }

        if (projectedUtilization > capacityLimit * 0.9) {
            return {
                allowed: true,
                reason: `Practitioner is approaching capacity: ${projectedUtilization.toFixed(1)}h / ${capacityLimit}h`,
                severity: 'WARN',
                details: { current: currentUtilization, project: projectedUtilization, limit: capacityLimit }
            };
        }

        return { allowed: true, severity: 'GREEN' };
    }
}
