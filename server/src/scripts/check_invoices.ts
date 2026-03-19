import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.invoice.findMany({ include: { lineItems: true } })
  .then(invs => {
    console.log(JSON.stringify(invs, null, 2));
    p.$disconnect();
  })
  .catch(e => {
    console.error(e);
    p.$disconnect();
  });
