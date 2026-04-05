import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.user.count();
  const users = await prisma.user.findMany({ take: 5 });
  console.log('User count:', count);
  console.log('Recent users:', JSON.stringify(users, null, 2));
}
main().finally(() => prisma.$disconnect());
