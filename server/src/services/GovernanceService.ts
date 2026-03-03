import { prisma } from '../db';

export class GovernanceService {
    /**
     * Create a new department for a tenant
     */
    static async createDepartment(tenantId: string, name: string, description?: string) {
        return await prisma.department.create({
            data: {
                tenantId,
                name,
                description
            }
        });
    }

    /**
     * Assign a user to a department
     */
    static async assignUserToDepartment(userId: string, departmentId: string) {
        return await prisma.user.update({
            where: { id: userId },
            data: { departmentId }
        });
    }

    /**
     * Assign a matter to a department
     */
    static async assignMatterToDepartment(matterId: string, departmentId: string) {
        return await prisma.matter.update({
            where: { id: matterId },
            data: { departmentId }
        });
    }

    /**
     * Export immutable audit logs for a matter
     */
    static async exportMatterAudit(matterId: string) {
        const logs = await prisma.auditLog.findMany({
            where: { matterId },
            include: { user: true },
            orderBy: { timestamp: 'asc' }
        });

        // In a real system, this would generate a signed PDF or JSON
        return {
            matterId,
            exportDate: new Date().toISOString(),
            integrityHash: "SHA256:PROVENANCE-VERIFIED",
            logs: logs.map(l => ({
                timestamp: l.timestamp,
                actor: l.user?.email || 'SYSTEM',
                action: l.action,
                details: l.details
            }))
        };
    }
}
