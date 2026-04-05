import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('[Sync] Finding users with null passwords...');
    
    const usersWithoutPassword = await prisma.user.findMany({
        where: {
            passwordHash: null
        }
    });

    console.log(`[Sync] Found ${usersWithoutPassword.length} users requiring native password migration.`);

    // "Sovereign2026!"
    const defaultHash = await bcrypt.hash('Sovereign2026!', 10);

    for (const user of usersWithoutPassword) {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: defaultHash }
        });
        console.log(`[Sync] Updated password for: ${user.email}`);
    }

    console.log('\n[Sync] Success! All legacy Firebase users now have the default native password:');
    console.log('Password: Sovereign2026!');
    console.log('You can now log in normally and configure Passkeys.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
