import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const TEMPLATES = [
    {
        name: 'Mutual Non-Disclosure Agreement',
        description: 'Standard NDA for mutual exchange of confidential business information.',
        category: 'Corporate',
        jurisdiction: 'GLOBAL',
        version: '1.2.0',
        placeholders: ['party_a_name', 'party_b_name', 'effective_date', 'purpose_description', 'governing_law'],
        content: `
# MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of **{{effective_date}}** (the "Effective Date") by and between:

**{{party_a_name}}**, a corporation organized and existing under the laws of {{governing_law}}, and

**{{party_b_name}}**, a corporation organized and existing under the laws of {{governing_law}}.

### 1. Purpose
The parties wish to explore a business opportunity of mutual interest (the "**{{purpose_description}}**"). In connection with the Purpose, each party may disclose to the other certain confidential technical and business information.

### 2. Confidential Information
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects...

### 3. Protection of Confidential Information
The Receiving Party shall use at least the same degree of care to protect the Disclosing Party's Confidential Information as it uses to protect its own confidential information...

---
Signed:

**For {{party_a_name}}:** ____________________

**For {{party_b_name}}:** ____________________
`
    },
    {
        name: 'Standard Employment Contract',
        description: 'Comprehensive employment agreement for full-time staff members.',
        category: 'Employment',
        jurisdiction: 'GHANA',
        version: '2.0.1',
        placeholders: ['employee_full_name', 'job_title', 'base_salary', 'start_date', 'probation_period_months'],
        content: `
# EMPLOYMENT AGREEMENT

**BETWEEN:** LexSovereign (the "Employer")

**AND:** **{{employee_full_name}}** (the "Employee")

### 1. POSITION AND DUTIES
The Employer hereby employs the Employee in the position of **{{job_title}}**.

### 2. COMMENCEMENT DATE
The Employee's employment will commence on **{{start_date}}**.

### 3. PROBATIONARY PERIOD
The first **{{probation_period_months}}** months of employment shall be a probationary period.

### 4. COMPENSATION
The Employer shall pay the Employee a base salary of **{{base_salary}}** per month, subject to standard deductions.

---
`
    },
    {
        name: 'Master Service Agreement (MSA)',
        description: 'Template for ongoing service provider relationships and SOWs.',
        category: 'Commercial',
        jurisdiction: 'GLOBAL',
        version: '1.5.0',
        placeholders: ['client_name', 'provider_name', 'services_summary', 'max_liability_amount', 'termination_notice_days'],
        content: `
# MASTER SERVICES AGREEMENT

This Master Services Agreement is made between **{{provider_name}}** ("Provider") and **{{client_name}}** ("Client").

### 1. SERVICES
Provider agrees to provide the following services: **{{services_summary}}**.

### 2. LIMITATION OF LIABILITY
Neither party shall be liable for any indirect, incidental, or consequential damages. The maximum liability of either party shall not exceed **{{max_liability_amount}}**.

### 3. TERMINATION
Either party may terminate this agreement upon **{{termination_notice_days}}** days written notice.

---
`
    },
    {
        name: 'Board Resolution: Officer Appointment',
        description: 'Formal board document for appointing corporate officers.',
        category: 'Governance',
        jurisdiction: 'GLOBAL',
        version: '1.0.0',
        placeholders: ['company_name', 'meeting_date', 'officer_name', 'officer_position'],
        content: `
# ACTION BY UNANIMOUS WRITTEN CONSENT OF THE BOARD OF DIRECTORS

OF **{{company_name}}**

The undersigned, being all of the members of the Board of Directors of **{{company_name}}**, hereby adopt the following resolutions as of **{{meeting_date}}**:

**WHEREAS**, it is in the best interest of the Company to appoint a **{{officer_position}}**.

**RESOLVED**, that **{{officer_name}}** is hereby appointed as the **{{officer_position}}** of the Company, to serve until a successor is duly elected and qualified.

---
`
    },
    {
        name: 'Consulting Services Agreement',
        description: 'Agreement for independent consultants and technical advisors.',
        category: 'Commercial',
        jurisdiction: 'MULTI',
        version: '1.1.0',
        placeholders: ['consultant_name', 'client_name', 'hourly_rate', 'ip_assignment_details'],
        content: `
# CONSULTING SERVICES AGREEMENT

This Agreement is entered into by **{{consultant_name}}** ("Consultant") and **{{client_name}}** ("Client").

### 1. ENGAGEMENT
Client hereby engages Consultant to perform the specified services at an hourly rate of **{{hourly_rate}}**.

### 2. INTELLECTUAL PROPERTY
All work product developed under this agreement is subject to the following assignment: **{{ip_assignment_details}}**.

---
`
    }
];

async function main() {
    console.log('🌱 Seeding Document Templates...');
    try {
        for (const t of TEMPLATES) {
            console.log(`Working on: ${t.name}`);
            await prisma.documentTemplate.upsert({
                where: { id: `template-${t.name.toLowerCase().replace(/ /g, '-')}` },
                update: {
                    content: t.content,
                    placeholders: t.placeholders,
                    description: t.description,
                    category: t.category,
                    jurisdiction: t.jurisdiction
                },
                create: {
                    id: `template-${t.name.toLowerCase().replace(/ /g, '-')}`,
                    name: t.name,
                    description: t.description,
                    category: t.category,
                    jurisdiction: t.jurisdiction,
                    content: t.content,
                    placeholders: t.placeholders,
                    version: t.version
                }
            });
        }
        console.log(`✅ Seeded ${TEMPLATES.length} Document Templates`);
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
