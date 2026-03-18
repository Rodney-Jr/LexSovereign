import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tenants = await prisma.tenant.findMany({
      take: 1,
      select: {
        id: true,
        uiVisibilityConfig: true
      } as any
    });
    console.log('Successfully queried Tenant.uiVisibilityConfig');
    console.log('Result:', JSON.stringify(tenants, null, 2));
  } catch (error: any) {
    console.error('Error querying Tenant.uiVisibilityConfig:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
