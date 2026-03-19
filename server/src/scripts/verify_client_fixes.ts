
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
    console.log('--- Verifying Client Fixes ---');

    // 1. Check CLIENT role permissions in DB
    const clientRole = await prisma.role.findFirst({
        where: { name: 'CLIENT' },
        include: { permissions: true }
    });

    if (!clientRole) {
        console.log('❌ CLIENT role not found');
    } else {
        const hasExportFinal = clientRole.permissions.some(p => p.id === 'export_final');
        console.log(`CLIENT Role Permissions: ${clientRole.permissions.map(p => p.id).join(', ')}`);
        console.log(hasExportFinal ? '✅ CLIENT role has export_final' : '❌ CLIENT role missing export_final');
    }

    // 2. Check Matter Visibility for Client
    const clientUser = await prisma.user.findFirst({
        where: { email: 'client@enterpriselegal.com' }
    });

    if (!clientUser) {
        console.log('❌ Client user not found');
    } else {
        console.log(`Checking matters for user: ${clientUser.name} (Role: ${clientUser.roleString})`);
        
        // Simulate backend query with the new logic if we were in the route
        // But here we'll just check if the matters exist and have the right client string
        const matters = await prisma.matter.findMany({
            where: {
                tenantId: clientUser.tenantId!,
                OR: [
                    { clientRef: { name: { contains: clientUser.name, mode: 'insensitive' } } },
                    { clientRef: { name: { contains: clientUser.name.split('(').pop()?.replace(')', '').trim() || '', mode: 'insensitive' } } }
                ]
            },
            include: { clientRef: true }
        });

        console.log(`Found ${matters.length} matters for client.`);
        matters.forEach(m => console.log(` - ${m.name} (Client: ${m.clientRef?.name || 'Unknown'})`));
        
        if (matters.length > 0) {
            console.log('✅ Client matter visibility verified (via query simulation)');
        } else {
            console.log('❌ No matters found for client matching name patterns');
        }
    }

    // 3. Verify Document URI schemes (should exist and be accessible by path manipulation)
    const docs = await prisma.document.findMany({
        where: { matter: { clientRef: { name: 'Acme Corp' } } }
    });

    console.log(`Found ${docs.length} documents for Acme Corp matters.`);
    for (const doc of docs) {
        console.log(` - ${doc.name} (URI: ${doc.uri})`);
        const canResolve = doc.uri.startsWith('file://') || doc.uri.startsWith('silo://') || doc.uri.startsWith('local://');
        console.log(canResolve ? `   ✅ URI scheme supported` : `   ❌ URI scheme '${doc.uri}' NOT supported`);
    }

    console.log('--- Verification Complete ---');
}

verify().catch(console.error).finally(() => prisma.$disconnect());
