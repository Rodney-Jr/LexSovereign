import { prisma } from '../db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting Production Demo Seeding...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Helpers to ensure idempotency ---
  async function upsertRole(name: string, tenantId: string, isSystem: boolean = false) {
    return await prisma.role.upsert({
      where: { name_tenantId: { name, tenantId } },
      create: { name, tenantId, isSystem },
      update: {}
    });
  }

  async function upsertUser(email: string, name: string, tenantId: string, roleId: string, roleString: string) {
    return await prisma.user.upsert({
      where: { email },
      create: { 
        email, 
        name, 
        passwordHash,
        tenantId, 
        roleId, 
        roleString, 
        isActive: true 
      },
      update: { 
        name, 
        passwordHash,
        roleId, 
        roleString, 
        tenantId, 
        isActive: true 
      }
    });
  }

  // ==========================================
  // 1. TENANT: Apex Law Partners (Law Firm)
  // ==========================================
  console.log('Creating Apex Law Partners (Law Firm)...');
  const lawFirmId = 'demo-tenant-lawfirm';
  
  let lawFirm = await prisma.tenant.findUnique({ where: { id: lawFirmId } });
  if (!lawFirm) {
    lawFirm = await prisma.tenant.create({
      data: {
        id: lawFirmId,
        name: 'Apex Law Partners',
        plan: 'ENTERPRISE',
        appMode: 'LAW_FIRM'
      }
    });
  } else {
    // Ensure properties are correct even if it exists
    lawFirm = await prisma.tenant.update({
        where: { id: lawFirmId },
        data: { name: 'Apex Law Partners', appMode: 'LAW_FIRM' }
    });
  }

  // Roles
  const partnerRole = await upsertRole('MANAGING_PARTNER', lawFirm.id, true);
  const srAssocRole = await upsertRole('SENIOR_ASSOCIATE', lawFirm.id, false);
  const jrAssocRole = await upsertRole('JUNIOR_ASSOCIATE', lawFirm.id, false);
  const paramRole = await upsertRole('PARALEGAL', lawFirm.id, false);
  const financeRole = await upsertRole('FINANCE_MANAGER', lawFirm.id, false);

  // Users (5 Internal)
  await upsertUser('kofi.partner@apexlaw.demo', 'Kofi Partner', lawFirm.id, partnerRole.id, 'MANAGING_PARTNER');
  await upsertUser('ama.senior@apexlaw.demo', 'Ama Senior', lawFirm.id, srAssocRole.id, 'SENIOR_ASSOCIATE');
  const kwame = await upsertUser('kwame.junior@apexlaw.demo', 'Kwame Junior', lawFirm.id, jrAssocRole.id, 'JUNIOR_ASSOCIATE');
  await upsertUser('abena.para@apexlaw.demo', 'Abena Paralegal', lawFirm.id, paramRole.id, 'PARALEGAL');
  await upsertUser('yaw.finance@apexlaw.demo', 'Yaw Finance', lawFirm.id, financeRole.id, 'FINANCE_MANAGER');

  // Matters & Documents for Law Firm (3 Clients)
  const lfMatters = [
    { id: 'lf-matter-1', name: 'Project Alpha M&A', client: 'TechFlow SA', type: 'Corporate', docName: 'Share Purchase Agreement v1' },
    { id: 'lf-matter-2', name: 'Regulatory Compliance Audit', client: 'Global Mining Co.', type: 'Regulatory', docName: 'Audit Report' },
    { id: 'lf-matter-3', name: 'Cantonments Property', client: 'Oaks & Partners Ltd.', type: 'Real Estate', docName: 'Deed of Assignment' }
  ];

  for (const m of lfMatters) {
    let clientR = await prisma.client.findFirst({ where: { name: m.client, tenantId: lawFirm.id }});
    if (!clientR) {
        clientR = await prisma.client.create({ data: { name: m.client, tenantId: lawFirm.id } });
    }
    await prisma.matter.upsert({
      where: { id: m.id },
      create: { id: m.id, name: m.name, clientId: clientR.id, type: m.type, tenantId: lawFirm.id, internalCounselId: kwame.id },
      update: { name: m.name, clientId: clientR.id }
    });
    
    // Simplistic document creation (tied to matter but uses fixed IDs for idempotency)
    const docId = `doc-${m.id}`;
    await prisma.document.upsert({
      where: { id: docId },
      create: { 
        id: docId, 
        name: m.docName, 
        matterId: m.id, 
        tenantId: lawFirm.id, 
        uri: `s3://mock/${docId}.pdf`, 
        jurisdiction: 'GH' 
      },
      update: { name: m.docName }
    });
  }


  // ==========================================
  // 2. TENANT: Global Logistics Corp (Enterprise)
  // ==========================================
  console.log('Creating Global Logistics Corp (Enterprise)...');
  const enterpriseId = 'demo-tenant-enterprise';
  
  let enterprise = await prisma.tenant.findUnique({ where: { id: enterpriseId } });
  if (!enterprise) {
    enterprise = await prisma.tenant.create({
      data: {
        id: enterpriseId,
        name: 'Global Logistics Corp',
        plan: 'ENTERPRISE',
        appMode: 'ENTERPRISE'
      }
    });
  } else {
    enterprise = await prisma.tenant.update({
        where: { id: enterpriseId },
        data: { name: 'Global Logistics Corp', appMode: 'ENTERPRISE' }
    });
  }

  // Roles
  const gcRole = await upsertRole('GENERAL_COUNSEL', enterprise.id, true);
  const srCounselRole = await upsertRole('SENIOR_COUNSEL', enterprise.id, false);
  const contractMgmtRole = await upsertRole('CONTRACT_MANAGER', enterprise.id, false);
  const compOfficerRole = await upsertRole('COMPLIANCE_OFFICER', enterprise.id, false);
  const legalOpsRole = await upsertRole('LEGAL_OPS', enterprise.id, false);

  // Users (5 Internal)
  await upsertUser('sarah.gc@globallogistics.demo', 'Sarah GC', enterprise.id, gcRole.id, 'GENERAL_COUNSEL');
  await upsertUser('michael.senior@globallogistics.demo', 'Michael Senior', enterprise.id, srCounselRole.id, 'SENIOR_COUNSEL');
  const emily = await upsertUser('emily.contracts@globallogistics.demo', 'Emily Contracts', enterprise.id, contractMgmtRole.id, 'CONTRACT_MANAGER');
  await upsertUser('david.compliance@globallogistics.demo', 'David Compliance', enterprise.id, compOfficerRole.id, 'COMPLIANCE_OFFICER');
  await upsertUser('jessica.ops@globallogistics.demo', 'Jessica Ops', enterprise.id, legalOpsRole.id, 'LEGAL_OPS');

  // Matters & Documents for Enterprise (3 Clients/Business Units)
  const entMatters = [
    { id: 'ent-matter-1', name: 'Q3 Employment Contracts', client: 'HR Department', type: 'Employment', docName: 'Standard Executive Contract' },
    { id: 'ent-matter-2', name: 'Cloud Infrastructure Renewal', client: 'IT Department', type: 'Vendor Contract', docName: 'SaaS Master Agreement' },
    { id: 'ent-matter-3', name: 'Logistics Vendor SLA', client: 'Vendor Alpha', type: 'Commercial', docName: 'Service Level Agreement' }
  ];

  for (const m of entMatters) {
    let clientR = await prisma.client.findFirst({ where: { name: m.client, tenantId: enterprise.id }});
    if (!clientR) {
        clientR = await prisma.client.create({ data: { name: m.client, tenantId: enterprise.id } });
    }
    await prisma.matter.upsert({
      where: { id: m.id },
      create: { id: m.id, name: m.name, clientId: clientR.id, type: m.type, tenantId: enterprise.id, internalCounselId: emily.id },
      update: { name: m.name, clientId: clientR.id }
    });

    const docId = `doc-${m.id}`;
    await prisma.document.upsert({
      where: { id: docId },
      create: { 
        id: docId, 
        name: m.docName, 
        matterId: m.id, 
        tenantId: enterprise.id, 
        uri: `s3://mock/${docId}.pdf`, 
        jurisdiction: 'GH' 
      },
      update: { name: m.docName }
    });
  }

  console.log('✅ Demo Production Data Seeded Successfully.');
  console.log('   Users can log in via Native Auth (password123).');
}

main().finally(() => prisma.$disconnect());
