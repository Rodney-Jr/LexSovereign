
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TenantService } from '../services/TenantService';
import { saveDocumentContent } from '../utils/fileStorage';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
    const tenantName = "Sovereign Legal Africa";
    const adminEmail = "partner@lexsovereign.com";
    
    console.log(`🌱 [Marketing Silo] Provisioning tenant: ${tenantName}...`);
    
    // Check if target user exists to avoid collision
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    let tenantId: string;
    let adminId: string;

    if (existing) {
        console.log("ℹ️ Marketing silo already exists. Force updating password and data...");
        await prisma.user.update({
            where: { email: adminEmail },
            data: { passwordHash }
        });
        tenantId = existing.tenantId!;
        adminId = existing.id;
    } else {
        // 1. Provision Tenant
        const result = await TenantService.provisionTenant({
            name: tenantName,
            adminEmail: adminEmail,
            adminName: "Senior Partner",
            plan: "INSTITUTIONAL",
            region: "GH_ACC_1",
            appMode: "LAW_FIRM",
            isTrial: false
        });
        
        tenantId = result.tenantId;
        adminId = result.adminId;

        // Manually set password to 'password123' (instead of the random tempPassword)
        await prisma.user.update({
            where: { id: adminId },
            data: { passwordHash }
        });
    }

    console.log("✅ Tenant & Admin Ready.");

    // 2. Seed Matters (High Stakes)
    const matters = [
        { id: 'MT-AF-001', name: 'Offshore Energy Compliance Audit - Jubilee Field', type: 'COMPLIANCE', riskLevel: 'HIGH' },
        { id: 'MT-AF-002', name: 'Mineral Rights Arbitration (Western Region)', type: 'LITIGATION', riskLevel: 'MEDIUM' },
        { id: 'MT-AF-003', name: 'Sovereign Data Privacy Review (Act 992)', type: 'ADMIN', riskLevel: 'LOW' }
    ];

    for (const m of matters) {
        await prisma.matter.upsert({
            where: { id: m.id },
            update: { tenantId },
            create: {
                id: m.id,
                name: m.name,
                type: m.type,
                status: 'OPEN',
                riskLevel: m.riskLevel,
                tenantId,
                internalCounselId: adminId
            }
        });
    }
    console.log("✅ Matters Seeded.");

    // 3. Seed "Risky" Document for StudioApp Capture
    const riskyContent = `
        <h1>MASTER SERVICE AGREEMENT - ENERGY CLUSTER</h1>
        <p>This Agreement is entered into by Sovereign Legal Africa on behalf of the Energy Cluster Consortium.</p>
        <p><strong>Section 4: Indemnification</strong></p>
        <p>The Service Provider shall indemnify, defend, and hold harmless the Client from and against any and all claims, including third party claims, without limitation of liability, even in cases of Client's own gross negligence.</p>
        <p><strong>Section 9: Non-Compete</strong></p>
        <p>The Service Provider shall not work for any other oil or gas entity in the West African sub-region for a period of 10 years following termination of this agreement.</p>
        <p><strong>Section 12: PII Data Handling</strong></p>
        <p>The following personal data may be shared in plain text: Social Security Numbers (SSN), Personnel Passport Copies, and Bank Details of all subcontractors to ensure regional transparency.</p>
    `;

    const fileName = 'Energy_Cluster_MSA_Draft.docx';
    
    // Prepare tenant context for saveDocumentContent
    const tenantContext = {
        id: tenantId,
        jurisdiction: 'GH_ACC_1'
    };

    // Save content to disk
    const relativePath = await saveDocumentContent(
        tenantContext,
        'MT-AF-001',
        fileName,
        riskyContent
    );

    const docUri = `file://${relativePath}`;
    const docId = 'DOC-AF-MSA-001';

    await prisma.document.upsert({
        where: { id: docId },
        update: {
            uri: docUri,
            name: fileName,
            matterId: 'MT-AF-001',
            tenantId,
            classification: 'Confidential'
        },
        create: {
            id: docId,
            name: fileName,
            uri: docUri,
            jurisdiction: 'GH_ACC_1',
            classification: 'Confidential',
            privilege: 'INTERNAL',
            matterId: 'MT-AF-001',
            tenantId,
            status: 'AI_DRAFTED',
            fileSize: BigInt(Buffer.byteLength(riskyContent, 'utf8'))
        }
    });
    console.log("✅ Risky Document Seeded to Vault for StudioApp Capture.");

    // 4. Seed Audit Logs (Forensic Chain)
    await prisma.auditLog.createMany({
        data: [
            { id: randomUUID(), action: 'AI_ACCESS_DRAFT', userId: adminId, details: 'Adversarial Risk Check: Section 4 Indemnification', matterId: 'MT-AF-001', tenantId },
            { id: randomUUID(), action: 'AI_OVERRIDE', userId: adminId, details: 'Authorized Manual PII bypass for authorized clerk', matterId: 'MT-AF-001', tenantId },
            { id: randomUUID(), action: 'VAULT_INTEGRITY_CHECK', userId: adminId, details: 'SHA256 Pulse Verification: Positive (No drift)', tenantId }
        ].map(log => ({ ...log, timestamp: new Date() })) as any
    });
    console.log("✅ Forensic Audit Logs Seeded.");

    console.log(`
    🚀 SILO PROVISIONED: Sovereign Legal Africa
    📧 EMAIL: ${adminEmail}
    🔑 PASSWORD: password123
    📄 TARGET DOC ID: ${docId}
    `);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});
