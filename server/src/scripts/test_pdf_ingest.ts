
import * as fs from 'fs';
import * as path from 'path';
import { JudicialIngestionService } from '../services/JudicialIngestionService';
import * as dotenv from 'dotenv';
import { EmbeddingService } from '../services/EmbeddingService';

dotenv.config();

async function testPdf() {
    const filename = 'constitutionofghana.pdf';
    const filepath = 'C:\\Users\\LENOVO\\Desktop\\Nomosdesk\\law_knowlege_base\\fg\\1992 constitution\\constitutionofghana.pdf';

    console.log(`Loading ${filepath}...`);
    const buffer = fs.readFileSync(filepath);

    try {
        console.log(`Starting ingestion test...`);
        const result = await JudicialIngestionService.ingestDocument(filename, buffer, 'CONSTITUTION', 'GH');
        console.log(`Result:`, result);
    } catch (err: any) {
        console.error(`Error:`, err.message);
        console.error(err.stack);
    }
}

testPdf().catch(console.error);
