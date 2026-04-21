import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.user.findUnique({where: {email: 'platform-admin@nomosdesk.com'}}).then(console.log).finally(() => p.$disconnect());
