import { prisma } from '../db';
import { EventBus } from './eventBus';

export class LitigationService {
    /**
     * Initialize a new Case with metadata
     */
    static async initializeCase(matterId: string, metadata: {
        jurisdiction?: string;
        caseNumber?: string;
        courtName?: string;
        judgeName?: string;
        filedDate?: string;
    }) {
        // 1. Fetch Matter to get tenantId
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            select: { tenantId: true }
        });

        if (!matter) throw new Error('Matter not found');

        return await prisma.caseMetadata.upsert({
            where: { matterId },
            update: {
                jurisdiction: metadata.jurisdiction,
                caseNumber: metadata.caseNumber,
                courtName: metadata.courtName,
                judgeName: metadata.judgeName,
                filedDate: metadata.filedDate ? new Date(metadata.filedDate) : undefined,
            },
            create: {
                matterId,
                tenantId: matter.tenantId,
                jurisdiction: metadata.jurisdiction,
                caseNumber: metadata.caseNumber,
                courtName: metadata.courtName,
                judgeName: metadata.judgeName,
                filedDate: metadata.filedDate ? new Date(metadata.filedDate) : undefined,
            }
        });
    }

    /**
     * Add a critical deadline to a litigation case
     */
    static async addDeadline(matterId: string, deadline: {
        title: string;
        dueDate: string;
        description?: string;
        priority?: string;
    }) {
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            select: { tenantId: true }
        });

        if (!matter) throw new Error('Matter not found');

        const newDeadline = await prisma.deadline.create({
            data: {
                matterId,
                tenantId: matter.tenantId,
                title: deadline.title,
                dueDate: new Date(deadline.dueDate),
                description: deadline.description,
                priority: deadline.priority || 'MEDIUM',
            }
        });

        EventBus.emit('DEADLINE_CREATED', newDeadline);
        return newDeadline;
    }

    /**
     * Schedule a hearing
     */
    static async scheduleHearing(matterId: string, hearing: {
        hearingDate: string;
        location?: string;
        purpose?: string;
        notes?: string;
    }) {
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            select: { tenantId: true }
        });

        if (!matter) throw new Error('Matter not found');

        const newHearing = await prisma.hearing.create({
            data: {
                matterId,
                tenantId: matter.tenantId,
                hearingDate: new Date(hearing.hearingDate),
                location: hearing.location,
                purpose: hearing.purpose,
                notes: hearing.notes,
            }
        });

        EventBus.emit('HEARING_SCHEDULED', newHearing);
        return newHearing;
    }

    /**
     * Link a document as evidence (Exhibit)
     */
    static async linkEvidence(matterId: string, documentId: string, evidence: {
        exhibitNumber?: string;
        description?: string;
        profferedBy?: string;
    }) {
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            select: { tenantId: true }
        });

        if (!matter) throw new Error('Matter not found');

        return await prisma.evidenceLink.create({
            data: {
                matterId,
                tenantId: matter.tenantId,
                documentId,
                exhibitNumber: evidence.exhibitNumber,
                description: evidence.description,
                profferedBy: evidence.profferedBy,
            }
        });
    }
}
