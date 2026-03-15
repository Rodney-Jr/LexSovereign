import fs from 'fs';
import { prisma } from './src/db';

async function inspectPermissions() {
    try {
        const roles = await prisma.role.findMany({
            include: { permissions: true }
        });

        let output = "--- Role Permissions Report ---\n";
        for (const role of roles) {
            output += `Role: ${role.name}\n`;
            output += `Permissions: ${role.permissions.map(p => p.id).join(', ')}\n`;
            output += "----------------------------\n";
        }

        fs.writeFileSync('perm_report.txt', output, 'utf8');
        console.log("Report written to perm_report.txt");

    } catch (e: any) {
        console.error("Inspection Failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectPermissions();
