# NomosDesk Staff Training & Reference Manual

Welcome to the NomosDesk internal training manual. This document serves as the definitive reference for staff members to understand the platform's core applications, the specific rationales behind their design (modals, workflows), and how to guide users (law firms, legal departments) to success.

---

## Core Philosophy & Sovereign Principles

NomosDesk is built on the concept of **Data Sovereignty** and **Zero-Egress Security**. Every feature is designed around these core principles:
1. **Logical Silos:** Tenant data is mathematically isolated. "Sovereign Citations" and AI inference strictly occur within this boundary.
2. **Data Access Service (DAS) Proxy:** PII (Personally Identifiable Information) is scrubbed in-memory *before* any text reaches the LLM. 
3. **ZK-Conflict Indexing:** The platform allows global conflict checks using blind SHA-256 hashes without revealing party names to the central database.

---

## Module 1: The Workspace & Matter Lifecycle

The core of a practitioner's day is spent managing legal matters. 

### Feature: Matter Creation & Case Center
**Workflow:**
1. A user initiates a new matter from the Dashboard.
2. They input the Client, Matter Name, and Type (e.g., "Property/Commercial").
3. The system runs an instant **ZK-Conflict Search** to ensure the firm has no conflicting interests.
4. Upon creation, the system routes the user to the `CaseCenter` or `CLMCenter`. 
5. *Automation Check:* If the matter is localized (e.g., Ghana Property), the backend automatically provisions statutory task checklists (e.g., Lands Commission Search).

### Key Modal: Matter Creation Modal (`MatterCreationModal.tsx`)
**Rationale:** Standardizing the intake process is critical to preventing billing leakage and ethical conflicts. 
**Workflow:** This multi-step modal forces the user to clear a blind conflict check *before* the matter database record is even initialized. It ensures that every matter has a defined "Risk Level" and assigned "Internal Counsel" for capacity tracking.

---

## Module 2: Intelligence & Document Ingestion (The Sovereign Sentinel)

NomosDesk sets itself apart with instant, localized legal intelligence.

### Feature: The Sovereign Sentinel & Review Hub
**Workflow:**
1. A user uploads a document (Word, PDF) into the **Document Vault**.
2. The **Sovereign Sentinel** (`ComplianceService`) instantly strips the file to plain text locally.
3. The Sentinel performs a PII heuristic scan. If it detects high volumes of identifiers, it flags a Data Protection warning (e.g., Act 843 compliance).
4. For specific jurisdictions like Ghana, it scans for "Foreign Governing Law" mismatches or "Stamp Duty Triggers."
5. The document appears in the `Review Hub` pre-scored out of 100 for compliance, saving the associate hours of manual first-pass review.

### Key Modal: Document Ingest Modal (`DocumentIngestModal.tsx`)
**Rationale:** Uploading files isn't just about storage; it's about semantic metadata.
**Workflow:** This modal explicitly asks the user to associate the document with a specific **Matter ID**. It acts as the gateway to the Sentinel, warning the user immediately if the document triggers PII rules before they finalize the upload.

---

## Module 3: Client Collaboration & Matter Tunnels

### Feature: The Client Portal & Bridge Registry
Law firms must share data with clients without losing cryptographic control over the document lifecycle.
**Workflow:**
1. To share a document externally, a Partner creates a "Matter Tunnel" in the `Bridge Registry`.
2. The system generates an HSM-signed (Hardware Security Module) ephemeral token.
3. The External Client logs into the Client Portal using their specific credentials.
4. They can view, comment on, and approve the document within the firm's silo boundary. Complete data residency validation!

## Module 4: Advanced Practitioner Workflows (Drafting, CLM, & Analysis)

The platform offers specialized interfaces for drafting contracts, managing case lifecycles, and analyzing risks.

### Feature: The Sovereign Marketplace & Template Discovery
**Workflow:**
1. A practitioner navigates to the `SovereignMarketplace` looking for precedent documents.
2. They browse verified Document Templates (e.g., standard NDAs, Land Purchase Agreements).
3. The user selects a template, which immediately launches the `DocumentTemplateMarketplace` modal.
4. They associate the template with an active matter, porting it directly into the Drafting Studio.

**Key Modal: Template Instantiation Modal (`DocumentTemplateMarketplace.tsx`)**
**Rationale:** Standardizing document generation prevents "rogue" unverified contracts. Selecting a template via this modal hard-links the resulting document to a specific Matter ID for accurate billing and audit tracing.

### Feature: Legal Drafting Studio
**Workflow:**
1. Within a matter, the practitioner accesses the `LegalDrafting` environment.
2. The user modifies clauses while the integrated billing timer silently increments time-spent in the background.
3. If they attempt an unverified clause, they can open the `SafeClauseAssistant` modal to pull pre-approved text from the sovereign library.

### Feature: CLM Operations (Contract Lifecycle Management)
**Workflow:**
1. Inside the `CLMCenter`, legal ops personnel track a contract's progression from Draft -> Negotiation -> Execution.
2. They use the `CLMIntakeModal` to rapidly ingest counter-party redlines.
3. The platform parses the contract metadata (Value, Expiry Date, Counter-party constraints) directly into the dashboard ledger to prevent missed renewals.

### Feature: Case Management & Case Analysis
**Workflow:**
1. Litigators manage chronological schedules, tasks, and opposing counsel details via the `CaseCenter`.
2. When deep synthesis is required, they trigger the `CaseAnalysisModal`.
3. **Rationale for the Case Analysis Modal:** Unlike casual chatting, this modal explicitly halts other UI actions. It takes the entire body of Case Law & Evidence currently in the Matter Vault and runs a deterministic "Risk/Success Probability Evaluation" using Gemini 3 Pro. The modal overlay ensures the practitioner remains focused on the strategic output rather than getting distracted by incoming notifications.

### Feature: Legal Chat Intelligence
**Workflow:**
1. The practitioner opens the dedicated `LegalChat` application.
2. **Rationale for Chat isolation:** The `LegalChat` modal/sidebar is distinct from the general AI review. It is explicitly designed for continuous Q&A spanning the entire Sovereign Knowledge Base, not just a single matter.
3. Every response generated within this chat includes deep-linked Sovereign Citations.

---

## Module 5: Sovereign Accounting & Ledgers

Tracking financial health with the same rigor as legal documents.

### Feature: Sovereign Accounting Modal (`AccountingDashboard.tsx`)
**Workflow:**
1. Practitioners log their time in the `DraftingStudio` using the integrated timer.
2. This creates instantaneous `TimeEntries` associated with the matter.
3. In the Accounting Dashboard, the finance team reviews the **General Ledger** and **Trust Ledger**. 
4. They can generate a single, professional PDF invoice compiling both billable hours and flat-fee AI usage costs.

**Rationale:** The Accounting Dashboard is designed as an isolated, modal-heavy interface (utilizing `InvoicePreviewModal` and `New Journal Entry Modal`). Financial data must be explicitly generated and exported. The dual-ledger system ensures strict compliance with bar association rules regarding the segregation of client trust accounts.

### Feature: Sovereign Expense Tracker
**Workflow:**
1. Lawyers in the field incur matter-specific expenses (e.g., Filing fees, Court transcription costs).
2. They navigate to the `SovereignExpenseTracker` and log the expense against a specific Matter ID.
3. Receipts are explicitly uploaded into the sovereign storage enclave, preventing sensitive financial documents from lingering in unmanaged email inboxes.

**Rationale:** The Expense Tracker is strictly partitioned from core accounting until approved. This prevents unverified expenses from accidentally inflating a client's final bill.

### Feature: Sovereign Asset Manager
**Workflow:**
1. The firm acquires physical or digital assets (e.g., Laptops, Software Subscriptions, FIPS Hardware Tokens).
2. The IT or Operations lead registers them in the `SovereignAssetManager`.
3. Assets are explicitly assigned to specific `User` profiles.

**Rationale:** In a high-security sovereign environment, hardware inventory is inextricably linked to data security. The Asset Manager ensures that when a staff member is off-boarded, there is a deterministic checklist of physical access tokens and encrypted hard drives that must be reclaimed.

---

## Module 6: Administration & Provisioning

Platform management is strictly tiered.

### Feature: Global Control Plane & Tenant Governance
**Workflow (Global Admin):**
1. Accesses the hidden `GlobalControlPlane` via the Root Handshake.
2. Manages regional Silo topographies (e.g., SOV-PR-1) and Gemini 3 model routing.
3. Creates new tenant environments.

### Key Modal: Provision Tenant Modal (`ProvisionTenantModal.tsx`)
**Rationale:** Multi-tenancy must be strictly logically separated from inception.
**Workflow:** The Global Admin configures the organization name, OIDC identity bridge, and assigns the foundational `GLOBAL_ADMIN` role required to unlock the tenant's dedicated PostgreSQL partition.

### Key Modal: User Invite Modal (`TenantAdministration.tsx`)
**Rationale:** Bringing new practitioners or clients into the silo requires strict Role-Based Access Control (RBAC). 
**Workflow:** The Tenant Admin selects whether the invitee is an "Internal Member" or "External Client." The modal dynamically filters available roles, ensuring a Client can never accidentally be assigned "Partner" access to internal case files.

---

## Module 7: Firm Management & HR Operations

NomosDesk provides built-in tools for internal firm operations, combining HR workflows with access governance.

### Feature: Sovereign Staff Dossier
**Workflow:**
1. A Legal Ops Manager accesses the `HRWorkbench`.
2. They select an employee's profile to open the `SovereignStaffDossierModal`.
3. They can review performance history, adjust compensation records, and verify physical/logical access credentials (e.g., GH Bar License, FIPS Token).

**Key Modal: Staff Dossier Modal (`SovereignStaffDossierModal.tsx`)**
**Rationale:** HR data is highly sensitive PII. Exposing it on a standard page layout risks shoulder-surfing or accidental screen-sharing leaks. The Dossier is locked within a high z-index modal with a blurred background so the reviewer must intentionally open it, review the specific data, and close it when done. 

### Feature: Leave Application & Approval
**Workflow:**
1. An Associate navigates to their profile and clicks "Apply for Leave".
2. The `LeaveApplicationModal` opens, requesting dates, leave type, and coverage notes.
3. Upon submission, it routes to their assigned Partner or HR Manager for approval in the `HRWorkbench`.

**Key Modal: Leave Application Modal (`LeaveApplicationModal.tsx`)**
**Rationale:** By integrating leave directly into the sovereign enclave, the system can automatically decrement available "staff capacity" metrics in the `CapacityDashboard`. This prevents Partners from assigning urgent matters to an associate who is about to go on scheduled leave.

### Feature: Access Governance & Role Templating
**Workflow:**
1. When onboarding a new cohort of associates, the Admin uses the `AccessGovernance` dashboard.
2. They trigger the `RoleTemplateMarketplace` modal.
3. They select standard pre-vetted roles (e.g., "Junior Associate - Litigation") applying granular permissions without manual configuration.

**Rationale:** Granular access (e.g., who can see trust accounts vs. who can draft documents) is complex and error-prone. The template marketplace modal acts as a visual safeguard, showing exactly what system access is being granted before the Admin commits the change to the database.

---

## Essential Reference: Modal Design Patterns

For UI/UX consistency, staff should note all NomosDesk modals adhere to the following strict patterns:
*   **The Glassmorphic Enclave:** Modals sit on a `bg-black/80 backdrop-blur-sm` overlay, drawing complete focus away from the underlying dashboard. 
*   **Hardware Keyboard Primacy:** Because legal ops workers move quickly, every modal supports the `ESC` key to close and traps focus to maintain keyboard navigation.
*   **Destructive Protection:** Any modal altering state (like modifying RBAC permissions in `RoleTemplateMarketplace.tsx` or archiving a matter) requires a distinct, visually separated confirmation action to prevent accidental data mutation.

---
**Maintained By:** NomosDesk Engineering Team  
**Review Cycle:** Updated continuously as new Sovereign components are deployed.
