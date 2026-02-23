# NomosDesk Corporate Identity & Regulatory Transparency Integration

> **DRAFT ONLY - PENDING HUMAN REVIEW & CONFIRMATION**
> *Goal: Strengthen transparency, credibility, and compliance positioning by formally integrating targeted corporate identity and regulatory classification.*

## 1. Executive Summary: Transparency Impact
Explicitly integrating Nexus Technologies Limited's corporate registration details and a clear "Trading As" (DBA) relationship into the NomosDesk platform achieves critical compliance objectives. It anchors the platform to a verifiable legal entity in Ghana, significantly increasing institutional credibility for enterprise and government clients. 

Furthermore, the explicit "Regulatory Classification Statement" acts as an aggressive liability shield. By proactively defining the platform as strictly a B2B SaaS provider and expressly disclaiming status as a law firm, financial institution, or data broker, we eliminate regulatory ambiguity and heavily insulate the corporate entity from unintended compliance burdens.

---

## 2. Clean Draft Language (Website-Ready)

### A. Corporate Transparency Disclosure Section (For Legal & Compliance Page)
**Corporate Identity**
*   **Legal Entity:** Nexus Technologies Limited
*   **Trading As:** NomosDesk
*   **Jurisdiction of Incorporation:** Accra, Ghana
*   **Company Registration Number:** CS339712014
*   **Registered Office Address:** 
    50 Caloundra Street,
    New Ashongman Estates,
    GE-208-4173 Accra,
    Ghana
*   **Principal Place of Business:** Same as registered office

### B. Regulatory Classification Statement (For Legal & Compliance Page)
**Regulatory Classification & Scope of Services**
NomosDesk is a proprietary B2B Software-as-a-Service (SaaS) platform providing cloud-based legal workflow infrastructure, artificial intelligence assistance tools, and practice and governance management software. 

**Explicit Exclusions:** Nexus Technologies Limited (trading as NomosDesk) operates exclusively as a technology provider. 
*   We are **not** a law firm, a legal services provider, or an Alternative Business Structure (ABS).
*   We are **not** a regulated financial institution or a payment processor. All payment processing is handled independently by secure third-party processors **[INSERT PAYMENT PROCESSOR]**.
*   We are **not** a data broker. We do not sell, rent, trade, or distribute user or end-client data to unauthorized third parties.

### C. Footer Legal Identity Integration
*Target: Under 60 words for the global footer.*

**Draft Footer Text:**
"© 2026 Nexus Technologies Limited (Reg: CS339712014) trading as NomosDesk. Registered in Accra, Ghana. NomosDesk is a B2B SaaS platform providing legal workflow tools; it is not a law firm, alternative business structure, or regulated financial institution. See our Privacy Policy and Terms of Service." *(45 words)*

### D. Terms of Service Update
**Clause 1. Acceptance of Terms & Corporate Identity** *(Replaces current opening clause)*
By accessing or using the NomosDesk platform ("Service"), provided by Nexus Technologies Limited (Company Registration No. CS339712014), trading as NomosDesk ("Company", "we", "us"), you agree to be bound by these Terms of Service ("Terms"). Nexus Technologies Limited is a registered company incorporated in Accra, Ghana, with its registered office at 50 Caloundra Street, New Ashongman Estates, GE-208-4173 Accra, Ghana.

**Clause 2. Description of Service** *(Amendment to cross-reference classification)*
NomosDesk is a secure legal matter management and governance platform. As detailed in our Regulatory Classification, we strictly provide B2B SaaS infrastructure. NomosDesk is not a law firm, and our software does not constitute legal advice or professional legal services.

### E. Privacy Policy Update
**Section 1. Data Roles & Corporate Identity** *(Replaces current opening data roles)*
NomosDesk is operated by Nexus Technologies Limited (Company Registration No. CS339712014), registered at 50 Caloundra Street, New Ashongman Estates, GE-208-4173 Accra, Ghana. 
*   **As a Controller:** We control the account data necessary to manage your subscription. 
*   **As a Processor:** For the legal files and client data you upload ("Customer Data"), we act strictly as a Data Processor. 
*   **No Data Brokerage:** NomosDesk is not a data broker and expressly prohibits the sale of any personal data.

**Section 11. Contact Us** *(Amendment)*
For privacy inquiries, please contact our Data Protection Officer at:
**Email:** privacy@nomosdesk.com
**Mail:** Nexus Technologies Limited, 50 Caloundra Street, New Ashongman Estates, GE-208-4173 Accra, Ghana.

---

## 3. Redline Version (Impact on Current Codebase)

*If approved, these modifications will be directly applied to the existing UI components and lean documents:*

*   **`marketing/src/layouts/Layout.tsx` (Footer):** Replacing the standard 2026 copyright string with the new 45-word Footer Legal Identity Integration string that explicitly calls out Nexus Technologies Limited, Accra, Ghana, and the Reg. No.
*   **`marketing/src/pages/TermsPage.tsx`:** Updating Sections 1 & 2 to inject the formal corporate entity identity, registration number, address, and DBA relationship.
*   **`marketing/src/pages/PrivacyPage.tsx`:** Updating Section 1 to identify the formal corporate address and explicitly state we are not a data broker. Update Section 11 to include the physical mailing address alongside the contact email.

---

## 4. Founder Review Checklist
- [ ] Confirm company registration number is accurate (`CS339712014`).
- [ ] Confirm registered office address layout and postal code format.
- [ ] Approve the "Trading As" (DBA) relationship articulation.
- [ ] Approve the explicit non-classification statements (not a payment processor, not an ABS, etc.).

## 5. Outstanding Confirmations Required
- **Payment Processor Name [REQUIRED]:** Need confirmation of the third-party payment processor used (e.g., Stripe, Paystack, Flutterwave) to finalize the regulatory classification statement before deploying it to the codebase.
