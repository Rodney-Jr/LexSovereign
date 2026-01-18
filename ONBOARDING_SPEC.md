# LexSovereign: Onboarding & Deployment Specification (Ghana-First)

This document outlines the sovereign onboarding protocols for the **LexSovereign** platform. Our architecture prioritizes **Logical Sovereignty**, ensuring that West African legal data remains isolated via software-defined silos and Cloud-KMS encryption.

---

## 1. Tenant Inception (The Organization Layer)

Tenant onboarding is the process of provisioning a unique **Logical Silo**. 

### Route A: Law Firm (The "Sovereign Chambers" Path)
*   **Persona:** Managing Partner / Head of IT.
*   **Objective:** Establish a digital chambers with GBA (Ghana Bar Association) ethical guardrails.
*   **Key Workflow:**
    1.  **Entity Validation:** Input Law Firm name and Registration ID.
    2.  **Identity Bridge:** Link the firm's OIDC (OpenID Connect) provider (e.g., Microsoft 365 / Azure AD).
    3.  **Silo Pinning:** Select `GH-ACC-1` (Accra Logical Silo).
    4.  **Guardrail Activation:** Enable *GBA Ethics Intercept* (blocks non-lawyers from triggering advice-heavy AI outputs).
    5.  **Billing:** Select *Sovereign Chambers* tier ($499/mo base).

### Route B: Legal Department (The "Enterprise Enclave" Path)
*   **Persona:** General Counsel / Legal Ops Manager.
*   **Objective:** Manage corporate legal spend and internal contract lifecycles.
*   **Key Workflow:**
    1.  **Entity Validation:** Input Corporate Entity name and Department Code.
    2.  **Identity Bridge:** Deep integration with Okta or corporate SAML provider.
    3.  **Silo Pinning:** Select `GH-ACC-1` or `Regional Cluster` for multi-national corps.
    4.  **Guardrail Activation:** Enable *BoG AML/KYC Feed* and *OCG (Outside Counsel Guidelines) Auditor*.
    5.  **Billing:** Select *Enterprise Tier* (Custom pricing based on data gravity).

---

## 2. Tenant Admin Onboarding (The Gatekeeper)

The first user created during Tenant Inception is automatically assigned the **Tenant Admin** role.

### The Handshake Sequence:
1.  **Hardware Verification:** The Admin must perform a **Deterministic Key Handshake** (biometric or hardware key) to bind their local device to the Silo's HSM root.
2.  **RBAC Matrix Setup:** Define custom roles or use LexSovereign defaults:
    *   *Law Firm:* Partner, Associate, Clerk, Legal Secretary.
    *   *Legal Dept:* General Counsel, Legal Analyst, Compliance Officer.
3.  **DAS Policy Config:** Configure the **Data Access Service (DAS)** Proxy level (e.g., "Always scrub PII for Associates," "Full access for Partners").

---

## 3. Tenant User Onboarding (The Practitioner)

Once the Silo is active, the Admin invites practitioners into the environment.

### The Invitation Loop:
1.  **OIDC Invitation:** Admin triggers an invitation via the `TenantAdministration` panel.
2.  **Sovereign Link:** User receives a one-time "Sovereign Link" that only resolves when accessed via the corporate domain.
3.  **ZK-Proof Enrollment:** User performs their first MFA event. LexSovereign generates a unique **Identity Fragment** on the user's hardware enclave.
4.  **Role Acceptance:**
    *   **Law Firm User:** Signs the "Ethical Use Affidavit" (digital trace recorded in the ledger) acknowledging GBA guardrails.
    *   **Legal Dept User:** Completes the "Internal Compliance Briefing" regarding PII handling.

---

## 4. UI Route Mapping

| Component | Route / View | Logic |
| :--- | :--- | :--- |
| `TenantOnboarding` | `/onboarding` | Used for new organizations. Checks for existing logical silos. |
| `AuthFlow` | `/login` | The primary gateway. Performs OIDC discovery and hardware MFA. |
| `AccessGovernance` | `/admin/access` | Admin-only view to modify user claims and DAS scrubbing levels. |
| `TenantAdministration` | `/admin/settings` | General silo management, billing, and user invitations. |

---

## 5. Security Guarantee: The "Ghana Silo"

Every user, regardless of route, operates within a **Zero-Egress** environment. 
- **Encryption:** All artifacts are wrapped in AES-256-GCM.
- **Inference:** Gemini 3 Pro requests are proxied via the DAS layer to ensure PII never leaves the logical silo boundary during analysis.
- **Audit:** Every interaction is timestamped and salted in the `DecisionTraceLedger`.
