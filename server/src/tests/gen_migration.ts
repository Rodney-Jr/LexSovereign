import { execSync } from 'child_process';
import fs from 'fs';

try {
    const shadowUrl = "postgresql://postgres:password@localhost:5432/postgres";
    const command = `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script --shadow-database-url "${shadowUrl}"`;
    console.log("Running diff...");
    const sql = execSync(command, { encoding: 'utf8' });
    fs.writeFileSync('prisma/migrations/full_migration.sql', sql);
    console.log("SUCCESS: Created prisma/migrations/full_migration.sql");
} catch (e: any) {
    console.error("FAILED:", e.message);
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.log(e.stderr);
}
