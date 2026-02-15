import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();
const TEMPLATES_DIR = path.join(__dirname, '../../prisma/templates');

async function main() {
    console.log('🌱 Discovering and Seeding Document Templates...');

    if (!fs.existsSync(TEMPLATES_DIR)) {
        console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));
    console.log(`🔍 Found ${files.length} template files.`);

    try {
        let count = 0;
        for (const file of files) {
            const filePath = path.join(TEMPLATES_DIR, file);
            const rawData = fs.readFileSync(filePath, 'utf8');
            const t = JSON.parse(rawData);

            // Normalize fields
            const name = t.name || t.template_name;
            if (!name) {
                console.warn(`⚠️ Skipping ${file}: No name or template_name found.`);
                continue;
            }

            console.log(`Working on: ${name}`);

            // Consolidate structure: prefer explicit structure object, fall back to clauses array
            const structure = t.structure || t.clauses || [];
            const content = t.content || ''; // Some new templates might rely purely on assembly of clauses

            const templateId = `template-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            await prisma.documentTemplate.upsert({
                where: { id: templateId },
                update: {
                    content: content,
                    structure: structure as any,
                    description: t.description || t.risk_level || '',
                    category: t.category || 'General',
                    jurisdiction: t.jurisdiction || 'GLOBAL',
                    version: t.version || '1.0.0'
                },
                create: {
                    id: templateId,
                    name: name,
                    description: t.description || t.risk_level || '',
                    category: t.category || 'General',
                    jurisdiction: t.jurisdiction || 'GLOBAL',
                    content: content,
                    structure: structure as any,
                    version: t.version || '1.0.0'
                }
            });
            count++;
        }
        console.log(`✅ Successfully seeded ${count} Document Templates.`);
    } catch (e) {
        console.error('❌ SEED ERROR:');
        console.dir(e, { depth: null });
        throw e;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
