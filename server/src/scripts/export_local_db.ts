
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
    console.log("📊 Starting local database export...");

    const gazetteCount = await prisma.gazetteEmbedding.count();
    const artifactCount = await prisma.knowledgeArtifact.count();

    console.log(`Found ${gazetteCount} Gazette Embeddings.`);
    console.log(`Found ${artifactCount} Knowledge Artifacts.`);

    if (gazetteCount === 0 && artifactCount === 0) {
        console.log("⚠️ No data found to export.");
        return;
    }

    const exportDir = path.resolve(__dirname, '../../data_export');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // Export Knowledge Artifacts
    if (artifactCount > 0) {
        console.log("📥 Exporting Knowledge Artifacts...");
        const artifacts = await prisma.knowledgeArtifact.findMany();
        fs.writeFileSync(path.join(exportDir, 'knowledge_artifacts.json'), JSON.stringify(artifacts, null, 2));
    }

    // Export Gazette Embeddings (in chunks due to potential size)
    if (gazetteCount > 0) {
        console.log("📥 Exporting Gazette Embeddings...");
        const CHUNK_SIZE = 1000;
        let skip = 0;
        let chunkIndex = 1;

        while (skip < gazetteCount) {
            const embeddings = await prisma.gazetteEmbedding.findMany({
                take: CHUNK_SIZE,
                skip: skip,
            });

            const fileName = `gazette_embeddings_part${chunkIndex}.json`;
            fs.writeFileSync(path.join(exportDir, fileName), JSON.stringify(embeddings, null, 2));

            console.log(`   ✅ Saved ${fileName} (${embeddings.length} records)`);
            skip += CHUNK_SIZE;
            chunkIndex++;
        }
    }

    console.log(`✨ Export complete! Data saved to: ${exportDir}`);
}

exportData()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
