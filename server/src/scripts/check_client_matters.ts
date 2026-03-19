
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'client@enterpriselegal.com' },
        include: {
            tenant: true
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User: ${user.email} (ID: ${user.id})`);
    console.log(`Tenant: ${user.tenant?.name} (ID: ${user.tenantId})`);
    console.log(`Separation Mode: ${user.tenant?.separationMode}`);

    if (!user.tenantId) {
        console.log('User has no tenant');
        return;
    }

    const matters = await prisma.matter.findMany({
        where: { tenantId: user.tenantId },
        include: { clientRef: true }
    });

    console.log(`\nTotal Matters in Tenant: ${matters.length}`);
    for (const m of matters) {
        console.log(`- Matter: ${m.name} (ID: ${m.id})`);
        console.log(`  Client String: ${m.clientRef?.name || 'Unknown'}`);
        console.log(`  Internal Counsel ID: ${m.internalCounselId}`);
    }

    const messages = await prisma.collaborationMessage.findMany({
        where: { authorId: user.id },
        include: { matter: true }
    });

    console.log(`\nClient Messages: ${messages.length}`);
    for (const msg of messages) {
        console.log(`- Matter: ${msg.matter.name} (ID: ${msg.matterId})`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
