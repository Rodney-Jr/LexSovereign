import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.documentTemplate.findMany();
  console.log('Templates Count:', templates.length);
  templates.forEach(t => {
    console.log(`- ${t.name} (ID: ${t.id})`);
    console.log(`  Content Length: ${t.content?.length || 0}`);
    console.log(`  Content Type: ${typeof t.content}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
