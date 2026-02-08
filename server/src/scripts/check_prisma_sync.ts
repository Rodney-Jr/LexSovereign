import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function checkPrisma() {
    const prisma = new PrismaClient();
    const results: any = {};

    const models = ['tenant', 'document', 'matter', 'user', 'role', 'policy'];

    for (const model of models) {
        try {
            const record = await (prisma as any)[model].findFirst();
            if (record) {
                results[`${model}Keys`] = Object.keys(record);
            } else {
                results[`${model}Error`] = "No records found";
            }
        } catch (e: any) {
            results[`${model}Error`] = e.message;
        }
    }

    results.invitationDelegate = !!(prisma as any).invitation;
    results.invitationsDelegate = !!(prisma as any).invitations;

    fs.writeFileSync('prisma_diagnostic.json', JSON.stringify(results, null, 2));
    console.log('✅ Diagnostic results written to prisma_diagnostic.json');
    await prisma.$disconnect();
}

checkPrisma();
