
import { PlatformService } from '../server/src/services/PlatformService.js';
import { prisma } from '../server/src/db.js';

async function test() {
    try {
        console.log("Checking Clause model...");
        const count = await prisma.clause.count();
        console.log(`Current clause count: ${count}`);

        console.log("Testing Create Global Clause...");
        const newClause = await PlatformService.createGlobalClause({
            title: "Test Force Majeure",
            category: "GENERAL",
            jurisdiction: "GH_ACC_1",
            content: { type: "doc", content: [] },
            tags: ["test", "verify"]
        });
        console.log("Created:", newClause.title, "ID:", newClause.id);

        console.log("Testing List...");
        const clauses = await PlatformService.getGlobalClauses();
        console.log(`Fetched ${clauses.length} clauses.`);

        console.log("Testing Delete...");
        await PlatformService.deleteGlobalClause(newClause.id);
        console.log("Deleted successfully.");

        process.exit(0);
    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    }
}

test();
