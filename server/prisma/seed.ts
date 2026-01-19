import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Tenant
    const tenant = await prisma.tenant.create({
        data: {
            name: 'LexSovereign Demo',
            plan: 'ENTERPRISE',
            primaryRegion: 'GH_ACC_1'
        }
    });

    // Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@lexsovereign.com',
            passwordHash,
            name: 'Sovereign Admin',
            role: 'GLOBAL_ADMIN',
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    const counsel = await prisma.user.create({
        data: {
            email: 'counsel@lexsovereign.com',
            passwordHash,
            name: 'Internal Counsel',
            role: 'INTERNAL_COUNSEL',
            region: 'GH_ACC_1',
            tenantId: tenant.id
        }
    });

    console.log({ admin, counsel });

    // Matters
    const matter1 = await prisma.matter.create({
        data: {
            id: 'MT-772',
            name: 'Acme Corp Merger',
            client: 'Acme Corp',
            type: 'M&A',
            status: 'OPEN',
            riskLevel: 'HIGH',
            tenantId: tenant.id,
            internalCounselId: counsel.id
        }
    });

    const matter2 = await prisma.matter.create({
        data: {
            id: 'ENT-991',
            name: 'Enterprise Licensing',
            client: 'Global Tech',
            type: 'Commercial',
            status: 'OPEN',
            riskLevel: 'LOW',
            tenantId: tenant.id,
            internalCounselId: counsel.id
        }
    });

    // Documents (from constants.ts)
    await prisma.document.create({
        data: {
            id: 'doc_001',
            name: 'Shareholder_Agreement_v2.pdf',
            uri: 'blob://gh/acc/mt-772/doc_001',
            jurisdiction: 'Ghana',
            privilege: 'PRIVILEGED',
            classification: 'Highly Sensitive',
            matterId: matter1.id
        }
    });

    await prisma.document.create({
        data: {
            id: 'doc_002',
            name: 'MSA_Standard_2024.docx',
            uri: 'blob://eu/fra/ent-991/doc_002',
            jurisdiction: 'EU-Germany',
            privilege: 'INTERNAL',
            classification: 'Confidential',
            matterId: matter2.id
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
