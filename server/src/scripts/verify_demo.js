const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- JS VERIFICATION START ---');
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET (using .env default)');

    try {
        const user = await prisma.user.findFirst({
            where: { email: 'mpartner@sovlegal.com' }
        });

        if (user) {
            console.log('✅ Found User:', {
                email: user.email,
                createdAt: user.createdAt,
                tenantId: user.tenantId
            });
        } else {
            console.log('❌ User NOT FOUND: mpartner@sovlegal.com');
        }
    } catch (err) {
        console.error('❌ Error during verification:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
