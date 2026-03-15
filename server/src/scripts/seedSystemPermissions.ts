import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_PERMISSIONS = [
  {
    id: 'access_hr_workbench',
    action: 'Access',
    resource: 'HR Hub',
    description: 'Grants access to the HR Workbench and workforce management tools.'
  },
  {
    id: 'access_accounting_hub',
    action: 'Access',
    resource: 'Financial Hub',
    description: 'Grants access to the Sovereign Accounting and global ledger tools.'
  },
  {
    id: 'access_platform_roadmap',
    action: 'View',
    resource: 'Project Roadmap',
    description: 'Grants visibility into the platform development roadmap and status.'
  },
  {
    id: 'access_infrastructure_plane',
    action: 'Access',
    resource: 'Infrastructure Plane',
    description: 'Grants access to the enclave infrastructure and system health dashboard.'
  },
  {
    id: 'view_trial_status',
    action: 'View',
    resource: 'Trial Status',
    description: 'Grants visibility into the sovereign trial status and expiration alerts.'
  }
];

async function main() {
  console.log('--- Seeding Granular System Permissions ---');

  for (const perm of NEW_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: {
        action: perm.action,
        resource: perm.resource,
        description: perm.description
      },
      create: perm
    });
    console.log(`Upserted permission: ${perm.id}`);
  }

  console.log('--- Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
