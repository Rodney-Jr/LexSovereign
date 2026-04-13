import { prisma } from '../db';

/**
 * Sovereign Hard Purge Script (V3)
 * Expanded to include all tenant-linked models to fix foreign key violations.
 */
async function main() {
    console.log('--- 🔥 Sovereign HARD PURGE Starting (V3) ---');

    const demoTenantName = 'NomosDesk Demo';
    const demoTenant = await prisma.tenant.findFirst({ where: { name: demoTenantName } });

    if (!demoTenant) {
        console.error('❌ Critical: Demo Tenant not found. Aborting.');
        process.exit(1);
    }
    const demoId = demoTenant.id;
    console.log(`🛡️ Preserving Tenant: ${demoTenant.name} (${demoId})`);

    const whereNotDemoStrict = { tenantId: { not: demoId } };
    const p = prisma as any;

    console.log('🧹 Purging related records...');

    // 1. Leaf and deep relation tables
    await p.auditLog.deleteMany({ 
        where: { 
            AND: [
                { tenantId: { not: demoId } },
                { tenantId: { not: null } }
            ]
        } 
    });
    await p.activityEntry.deleteMany({ where: whereNotDemoStrict });
    await p.documentVersion.deleteMany({ where: whereNotDemoStrict });
    await p.evidenceLink.deleteMany({ where: whereNotDemoStrict });
    await p.document.deleteMany({ where: whereNotDemoStrict });
    await p.collaborationMessage.deleteMany({ where: whereNotDemoStrict });
    await p.timeEntry.deleteMany({ where: whereNotDemoStrict });
    await p.task.deleteMany({ where: whereNotDemoStrict });
    await p.approval.deleteMany({ where: whereNotDemoStrict });
    await p.hearing.deleteMany({ where: whereNotDemoStrict });
    await p.deadline.deleteMany({ where: whereNotDemoStrict });
    await p.caseMetadata.deleteMany({ where: whereNotDemoStrict });
    await p.contractMetadata.deleteMany({ where: whereNotDemoStrict });
    await p.predictiveRisk.deleteMany({ where: whereNotDemoStrict });
    await p.aIRiskAnalysis.deleteMany({ where: whereNotDemoStrict });
    await p.aIUsage.deleteMany({ where: whereNotDemoStrict });

    // 2. Mid-level Infrastucture
    await p.matterTeamMember.deleteMany({ where: { matter: { tenantId: { not: demoId } } } });
    await p.matter.deleteMany({ where: whereNotDemoStrict });
    await p.client.deleteMany({ where: whereNotDemoStrict });
    await p.policy.deleteMany({ where: whereNotDemoStrict });
    
    // 3. System Enclaves and Configs (Missed in V2)
    console.log('🧹 Purging configs and integrations...');
    await p.chatbotConfig.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.invitation.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.apiKey.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.firmAccount.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.ledgerTransaction.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.bankTransaction.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.externalMapping.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.syncLog.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.cloudIntegration.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.platformFolderSync.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.firmAsset.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.expense.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.leaveRecord.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.candidate.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.cLERecord.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.salaryRecord.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.performanceAppraisal.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.onboardingItem.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.brandingProfile.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.lead.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.bridge.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.chatConversation.deleteMany({ where: { tenantId: { not: demoId } } });
    await p.documentTemplate.deleteMany({ 
        where: { 
            AND: [
                { tenantId: { not: demoId } },
                { tenantId: { not: null } }
            ]
        } 
    });

    // 4. Users and Roles
    console.log('🧹 Purging user and role hierarchy...');
    await p.user.deleteMany({ 
        where: { 
            AND: [
                { tenantId: { not: demoId } },
                { tenantId: { not: null } },
                { email: { not: 'admin@nomosdesk.com' } }
            ]
        } 
    });
    
    await p.role.deleteMany({ 
        where: { 
            AND: [
                { tenantId: { not: demoId } },
                { tenantId: { not: null } }
            ]
        } 
    });

    // 5. Final Blow
    console.log('💥 Executing final Tenant removal...');
    const result = await prisma.tenant.deleteMany({
        where: { id: { not: demoId } }
    });

    console.log(`🚀 [Success] Hard Purged ${result.count} tenants.`);
    const finalCount = await prisma.tenant.count();
    console.log(`📊 Final Platform Footprint: ${finalCount} tenant(s) remaining.`);
}

main()
    .catch((e) => {
        console.error('❌ Hard Purge Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
