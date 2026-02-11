
import { ingestGazette } from '../server/src/scripts/gazetteIngestor';
import { LegalQueryService } from '../server/src/services/legalQueryService';

async function runDemo() {
    console.log("🛠️ Starting Gazette RAG Demo...");

    // 1. Mock Ingestion (In a real scenario, this would use a live PDF URL)
    // For the demo, we'll assume the ingestor is called with a verified PDF
    const samplePdfUrl = "https://www.justice.gov.ng/gazette/sample-regulation.pdf";
    const region = "NG";
    const title = "Nigeria Data Protection Regulation 2019";

    console.log(`\n1. Ingestion Step (Demonstration)`);
    console.log(`Action: ingestGazette("${samplePdfUrl}", "${region}", "${title}")`);
    console.log(`Effect: Parses PDF, chunks text, generates embeddings, and stores in Postgres.`);

    // 2. Retrieval Step
    console.log(`\n2. Retrieval Step`);
    const query = "What are the penalties for data breach under Nigerian law?";
    console.log(`User Query: "${query}"`);

    console.log("🔍 Performing Vector Similarity Search...");
    const excerpts = await LegalQueryService.getRelevantStatutes(query, region);

    if (excerpts.length === 0) {
        console.log("⚠️ No excerpts found. (This is expected if no data has been ingested into the local DB yet).");
    } else {
        excerpts.forEach((e, i) => {
            console.log(`\n[Relevant Result ${i + 1}] (Confidence: ${e.score.toFixed(4)})`);
            console.log(`Title: ${e.title}`);
            console.log(`Source: ${e.sourceUrl}`);
            console.log(`Content: ${e.contentChunk.substring(0, 300)}...`);
        });
    }

    console.log("\n3. AI Response Flow (Enforced Prompt)");
    console.log("Prompt: 'Base your answer ONLY on the provided Gazette excerpts...'");
    console.log("AI will now use the retrieved excerpts to formulate a grounded response with citations.");
}

runDemo().catch(console.error);
