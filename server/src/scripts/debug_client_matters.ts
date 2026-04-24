
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'john.doe@client.com' }
    });
    console.log('User:', user);

    const matters = await prisma.matter.findMany({
        where: { clientId: user?.clientId || 'none' }
    });
    console.log('Matters for client:', matters.map(m => m.id));

    const allMatters = await prisma.matter.findMany();
    console.log('All matters:', allMatters.map(m => m.id));
}

check();
