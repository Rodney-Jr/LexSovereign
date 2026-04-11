
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testInvitation() {
  const token = 'TEST-INV-' + Math.random().toString(36).substring(7).toUpperCase();
  const name = 'Test User Esq.';
  const email = 'test@example.com';
  const tenantId = '72e8eceb-0212-46ff-a8ec-2d69df39c0e0'; // Use an existing tenant ID from your DB if needed, or assume first tenant
  
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("No tenant found for testing");

    console.log('Creating invitation for:', name);
    const invitation = await (prisma.invitation as any).create({
      data: {
        token,
        email,
        name,
        roleName: 'INTERNAL_COUNSEL',
        tenantId: tenant.id,
        expiresAt: new Date(Date.now() + 86400000)
      }
    });

    console.log('Invitation created successfully.');

    console.log('Resolving invitation...');
    // Simulate resolution logic
    const resolved = await prisma.invitation.findUnique({
      where: { token, isUsed: false },
      include: { tenant: true }
    });

    if (resolved && (resolved as any).name === name) {
      console.log('SUCCESS: Name persisted and resolved correctly:', (resolved as any).name);
    } else {
      console.error('FAILURE: Name mismatch or resolution failed.');
    }

    // Cleanup
    await prisma.invitation.delete({ where: { id: (resolved as any).id } });
    console.log('Cleanup complete.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvitation();
