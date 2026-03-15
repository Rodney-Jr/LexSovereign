import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('🗑️ Cleaning up demo tenant "Enterprise Legal"...');
  const tenant = await prisma.tenant.findFirst({ where: { name: 'Enterprise Legal' } });
  if (tenant) {
    // Delete cascading references if they don't have onDelete: Cascade
    await prisma.collaborationMessage.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.matter.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.role.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    console.log('✅ Cleanup complete.');
  } else {
    console.log('ℹ️ No demo tenant found.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
