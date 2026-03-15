const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

async function testUpload() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { roleString: 'MANAGING_PARTNER' } });
  
  if (!user) {
    console.log('No managing partner found');
    return;
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET || 'sovereign_local_secret_2026',
    { expiresIn: '1h' }
  );

  try {
      const res = await fetch('http://localhost:3001/api/document-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: 'Managing Partner Template Test',
          description: 'Testing upload as Managing Partner',
          category: 'GENERAL',
          jurisdiction: 'GH_ACC_1',
          content: 'Test content here',
          version: '1.0.0'
        })
      });
      
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Response:', data);
  } catch (e) {
      console.error(e);
  } finally {
      await prisma.$disconnect();
  }
}

testUpload();
