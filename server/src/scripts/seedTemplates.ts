import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Locked scope: 10 specific templates
const TEMPLATES = [
    {
        name: 'Mutual Non-Disclosure Agreement',
        description: 'Standard NDA for mutual exchange of confidential business information between two parties.',
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
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects that is designated as "Confidential," "Proprietary" or some similar designation.

### 3. Term
This Agreement and the duty to hold Confidential Information in confidence shall remain in effect for a period of five (5) years.

---
Signed:

**For {{party_a_name}}:** ____________________ Date: _________

**For {{party_b_name}}:** ____________________ Date: _________
`
    },
    {
        name: 'Service Agreement',
        description: 'Agreement defining the relationship between a service provider and a client.',
        category: 'Corporate',
        jurisdiction: 'GLOBAL',
        version: '1.0.0',
        placeholders: ['provider_name', 'client_name', 'service_description', 'payment_terms', 'start_date'],
        content: `
# SERVICE AGREEMENT

This Service Agreement is made between **{{provider_name}}** ("Provider") and **{{client_name}}** ("Client") as of **{{start_date}}**.

### 1. Services Provided
Provider agrees to render the following services to Client: **{{service_description}}**.

### 2. Payment Terms
Client agrees to pay Provider according to the following schedule: **{{payment_terms}}**.

### 3. Independent Contractor
Provider enters this Agreement as an independent contractor and not as an employee of Client.

---
`
    },
    {
        name: 'Employment Contract',
        description: 'Standard full-time employment contract outlining duties, compensation, and benefits.',
        category: 'Employment',
        jurisdiction: 'Local',
        version: '2.1.0',
        placeholders: ['employee_name', 'company_name', 'position_title', 'salary_amount', 'start_date'],
        content: `
# EMPLOYMENT CONTRACT

**THIS AGREEMENT** is made on **{{start_date}}** BETWEEN **{{company_name}}** (the "Employer") AND **{{employee_name}}** (the "Employee").

### 1. Position
The Employer employs the Employee in the position of **{{position_title}}**.

### 2. Remuneration
The Employee will receive a gross annual salary of **{{salary_amount}}**, payable in monthly installments.

### 3. Duties
The Employee agrees to devote their full working time and attention to the business of the Employer.

---
`
    },
    {
        name: 'Offer Letter',
        description: 'Formal letter offering employment to a candidate.',
        category: 'Employment',
        jurisdiction: 'Local',
        version: '1.0.0',
        placeholders: ['candidate_name', 'company_name', 'offer_position', 'start_date', 'supervisor_name'],
        content: `
# EMPLOYMENT OFFER LETTER

**Date:** {{start_date}}

**To:** {{candidate_name}}

**Dear {{candidate_name}},**

**{{company_name}}** is pleased to offer you the position of **{{offer_position}}**. We believe your skills and experience are an excellent match for our company.

**Start Date:** Your employment will commence on {{start_date}}.
**Reporting To:** You will report directly to **{{supervisor_name}}**.

We look forward to welcoming you to the team.

Sincerely,

Hiring Manager
**{{company_name}}**
`
    },
    {
        name: 'Memorandum of Understanding (MoU)',
        description: 'Non-binding agreement outlining the terms of a new relationship.',
        category: 'Corporate',
        jurisdiction: 'GLOBAL',
        version: '1.1.0',
        placeholders: ['party_a', 'party_b', 'mutual_goal', 'signing_date'],
        content: `
# MEMORANDUM OF UNDERSTANDING

This Memorandum of Understanding (MoU) is made on **{{signing_date}}** between **{{party_a}}** and **{{party_b}}**.

### 1. Objective
The parties share the common goal of **{{mutual_goal}}**. This MoU outlines the framework for cooperation to achieve this objective.

### 2. Non-Binding
This MoU is not intended to create legal or binding obligations between the Parties.

---
`
    },
    {
        name: 'Demand Letter',
        description: 'Formal letter demanding payment or action to resolve a dispute.',
        category: 'Disputes',
        jurisdiction: 'Local',
        version: '1.0.0',
        placeholders: ['recipient_name', 'sender_name', 'amount_due', 'breach_details', 'deadline_date'],
        content: `
# CEASE AND DESIST / DEMAND LETTER

**DATE:** {{deadline_date}}

**TO:** {{recipient_name}}

**FROM:** {{sender_name}}

**RE:** Demand for Payment / Cease and Desist

Dear Sir/Madam,

This letter serves as a formal demand regarding **{{breach_details}}**.

You are hereby required to pay the outstanding amount of **{{amount_due}}** by **{{deadline_date}}**. Failure to comply will result in immediate legal action.

Governed yourself accordingly.

Sincerely,
**{{sender_name}}**
`
    },
    {
        name: 'Board Resolution',
        description: 'Record of decisions made by the Board of Directors.',
        category: 'Corporate',
        jurisdiction: 'GLOBAL',
        version: '1.0.0',
        placeholders: ['company_name', 'meeting_date', 'resolution_topic', 'decision_details'],
        content: `
# BOARD RESOLUTION OF {{company_name}}

**DATE:** {{meeting_date}}

**TOPIC:** {{resolution_topic}}

**WHEREAS**, the Board of Directors of **{{company_name}}** has discussed the matter of **{{resolution_topic}}**;

**IT IS HEREBY RESOLVED:**
That **{{decision_details}}**.

The undersigned certify that the foregoing resolution was duly adopted by the Board of Directors.

---
`
    },
    {
        name: 'Lease Agreement',
        description: 'Contract for renting residential or commercial property.',
        category: 'Property',
        jurisdiction: 'Local',
        version: '1.3.0',
        placeholders: ['landlord_name', 'tenant_name', 'property_address', 'monthly_rent', 'lease_term_months'],
        content: `
# RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made between **{{landlord_name}}** ("Landlord") and **{{tenant_name}}** ("Tenant").

### 1. Property
Landlord agrees to lease to Tenant the premises located at: **{{property_address}}**.

### 2. Term
The term of this lease shall be for **{{lease_term_months}}** months.

### 3. Rent
Tenant agrees to pay **{{monthly_rent}}** per month on the 1st day of each month.

---
`
    },
    {
        name: 'Privacy Policy',
        description: 'Policy outlining how an organization collects and handles data.',
        category: 'Compliance',
        jurisdiction: 'GLOBAL',
        version: '2.0.0',
        placeholders: ['company_name', 'website_url', 'contact_email', 'data_types_collected'],
        content: `
# PRIVACY POLICY

**Last Updated:** {{start_date}}

**{{company_name}}** ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website **{{website_url}}**.

### 1. Information We Collect
We collect the following types of information: **{{data_types_collected}}**.

### 2. How We Use Information
We use the information we collect to provide, maintain, and improve our services.

### Contact Us
If you have questions, please contact us at **{{contact_email}}**.
`
    },
    {
        name: 'Termination Letter',
        description: 'Formal notifice of contract or employment termination.',
        category: 'Employment',
        jurisdiction: 'Local',
        version: '1.0.0',
        placeholders: ['recipient_name', 'company_name', 'termination_date', 'reason_for_termination'],
        content: `
# NOTICE OF TERMINATION

**TO:** {{recipient_name}}

**FROM:** {{company_name}}

**DATE:** Today

**RE:** Termination of Employment

Dear {{recipient_name}},

This letter serves to confirm that your employment with **{{company_name}}** is terminated effective **{{termination_date}}**.

Reason for termination: **{{reason_for_termination}}**.

Please return all company property immediately.

Sincerely,

Human Resources
**{{company_name}}**
`
    }
];

async function main() {
    console.log('🌱 Seeding Locked Scope Document Templates (10 Items)...');
    try {
        for (const t of TEMPLATES) {
            console.log(`Working on: ${t.name}`);
            await prisma.documentTemplate.upsert({
                where: { id: `template-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
                update: {
                    content: t.content,
                    placeholders: t.placeholders,
                    description: t.description,
                    category: t.category,
                    jurisdiction: t.jurisdiction,
                    version: t.version
                },
                create: {
                    id: `template-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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
