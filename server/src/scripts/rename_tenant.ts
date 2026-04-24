import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
const prisma = new PrismaClient();

async function renameTenant() {
  const result = await prisma.tenant.updateMany({
    where: { name: 'Nomos Law & Co' },
    data: { name: 'Nomos Law' }
  });
  console.log(`Renamed ${result.count} tenants.`);
}

renameTenant()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
