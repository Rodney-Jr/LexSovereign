import { prisma } from '../server/src/db';

async function testDirect() {
    try {
        const tenant = await prisma.tenant.findFirst({ where: { name: 'Enterprise Legal' } });
        if (!tenant) throw new Error("Tenant not found");

        console.log("Found tenant:", tenant.id);

        const template = await prisma.documentTemplate.create({
            data: {
                name: 'Direct Test Template',
                description: 'direct test',
                category: 'GENERAL',
                jurisdiction: 'GH_ACC_1',
                content: '# Content',
                version: '1.0.0',
                tenantId: tenant.id
            }
        });

        console.log("Success! Template ID:", template.id);

        // Cleanup
        await prisma.documentTemplate.delete({ where: { id: template.id } });
        console.log("Cleanup successful");

    } catch (e: any) {
        console.error("Direct Upload Failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDirect();
