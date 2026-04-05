import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const permissions = await prisma.permission.findMany();
    console.log('--- ALL PERMISSIONS ---');
    console.log(JSON.stringify(permissions.map(p => p.id), null, 2));
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
