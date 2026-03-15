import fs from 'fs';
import { prisma } from './src/db';

async function inspectUsers() {
    try {
        const users = await prisma.user.findMany({
            include: { role: { include: { permissions: true } } }
        });

        let output = "--- User Role Inspection (Verified) ---\n";
        for (const user of users) {
            output += `User: ${user.email}\n`;
            output += `Role: ${user.role?.name} (ID: ${user.roleId})\n`;
            output += `Permissions: ${user.role?.permissions.map(p => p.id).join(', ')}\n`;
            output += "----------------------------\n";
        }

        fs.writeFileSync('user_report_verified.txt', output, 'utf8');
        console.log("Report written to user_report_verified.txt");

    } catch (e: any) {
        console.error("Inspection Failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectUsers();
