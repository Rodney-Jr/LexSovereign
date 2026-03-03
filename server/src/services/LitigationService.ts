import { prisma } from '../db';
import { EventBus } from './EventBus';

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
        const newDeadline = await prisma.deadline.create({
            data: {
                matterId,
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
        const newHearing = await prisma.hearing.create({
            data: {
                matterId,
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
        return await prisma.evidenceLink.create({
            data: {
                matterId,
                documentId,
                exhibitNumber: evidence.exhibitNumber,
                description: evidence.description,
                profferedBy: evidence.profferedBy,
            }
        });
    }
}
