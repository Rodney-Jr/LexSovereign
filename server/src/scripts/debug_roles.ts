console.log('--- SCRIPT START ---');
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET (using .env default)');
    const user = await prisma.user.findFirst({
        where: { email: 'mpartner@sovlegal.com' }
    });
    console.log('Target User:', user ? { email: user.email, createdAt: user.createdAt, tenantId: user.tenantId } : 'NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
