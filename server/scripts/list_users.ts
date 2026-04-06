import { prisma } from '../src/db';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      roleString: true,
      tenantId: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
