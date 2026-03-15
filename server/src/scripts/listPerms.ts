import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const perms = await prisma.permission.findMany();
  console.log(JSON.stringify(perms.map(p => p.id), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
