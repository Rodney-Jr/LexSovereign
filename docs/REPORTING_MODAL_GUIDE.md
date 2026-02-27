# NomosDesk Reporting & Compliance Export Guide

This document explains the "Reporting Modal" functionality within NomosDesk, focusing on how compliance reports are generated, accessed, and used for regulatory oversight.

---

## 1. Overview of the Reporting Ecosystem

In NomosDesk, "Reporting" is not a single modal but a multi-layered system designed to provide physical and logical proof of compliance for Sovereign jurisdictions. 

The primary components of this ecosystem are:

1.  **Sovereign Audit Export (`ComplianceExport.tsx`)**: The actual "Reporting" interface where formal audit packages are synthesized.
2.  **Immutable Decision Trace Ledger (`DecisionTraceLedger.tsx`)**: A granular view of every AI decision and its cryptographic hash.
3.  **Global Audit Pulse**: A real-time telemetry stream of system actions.
4.  **Executive Dashboards**: (`GrowthDashboard`, `CapacityDashboard`, `PredictiveOps`) which provide high-level ROI and operational reports.

---

## 2. The Current "Reporting Modal": Sovereign Audit Export

While currently implemented as a functional component, the **Sovereign Audit Export** (`ComplianceExport.tsx`) is designed to be triggered as a high-security modal for auditors.

### Key Functionality:
- **Formal Synthesis**: It aggregates raw `AuditLog` entries and uses the **LexGemini AI Service** to generate a "Formal Compliance Artifact."
- **Evidence Chains**: Displays raw cryptographic tokens (SHA-256 hashes) associated with each audited action.
- **Signed Artifacts**: Supports downloading as a "Signed PDF" which includes the jurisdictional Silo metadata and timestamp.
- **Auditor Sharing**: Enables direct encrypted sharing of the report with external regulatory bodies.

### Technical Trigger Pattern:
The reporting functionality is intended to be triggered from the **Global Control Plane** or the **Decision Trace Ledger** using the "Sovereign Report (Board Level)" action.

---

## 3. How Reports are Generated

Compliance reports are generated using a "Zero-Knowledge" metadata approach:

1.  **Action Logs**: Every system action (e.g., Matter Creation, Document Export) is logged via `AuditService.ts` with a tamper-evident SHA-256 hash.
2.  **Scanning**: The `AuditorService.ts` performs real-time scans of content for UPL (Unauthorized Practice of Law) or regulatory violations.
3.  **Synthesis Request**: When an admin clicks "Generate Audit Package," the `ComplianceExport` component sends a selection of logs to `LexGeminiService.generateComplianceReport`.
4.  **AI Narrative**: The AI analyzes the pattern of logs and hashes to verify that all safety protocols (PII scrubbing, RRE evaluation) were followed.
5.  **Signing**: The resulting text is pinned to the current "Sovereign Enclave" session and made available for export.

---

## 4. Role-Based Access Control (RBAC) in Reporting

Reporting access is strictly governed by the user's role:

| Feature | Global Admin | Tenant Admin | Partner | External Auditor |
| :--- | :---: | :---: | :---: | :---: |
| View Global Audit Pulse | ✅ | ❌ | ❌ | ❌ |
| Generate Board-Level Report | ✅ | ✅ (Tenant Only) | ❌ | ❌ |
| View Cryptographic Proofs | ✅ | ✅ | ✅ | ✅ |
| Download Signed PDF | ✅ | ✅ | ❌ | ✅ |

---

## 5. Sovereign Proof: Data Residency Validation

A critical feature of the NomosDesk reporting system is the ability to provide **Physical Transparency** regarding where data is processed. This is essential for "selling" the integrity of the Sovereign Silo to regulators.

- **Residency Verification**: Reports generated via `ComplianceExport` include a **Silo-Datacenter Token**. This token cryptographically binds the audit report to the physical Railway region (e.g., `europe-west4-drams3a`) where the compute occurred.
- **Hardware-In-Loop Proof**: For Sovereign plans, the report includes a summary of the **Hardware Enclave Handshakes** used for that session, proving that OIDC credentials were tied to physical hardware in the allowed jurisdiction.
- **Silo Integrity Audit**: Auditors can request a "Silo Integrity Report" which provides an automated walkthrough of the current `RAILWAY_SILO_MAPPING.md` alignment for that specific tenant.

---

## 6. Roadmap: The Audit Log Viewer Modal

As documented in the `MODALS_GUIDE.md`, a dedicated **Audit Log Viewer Modal** is a planned enhancement. This modal will integrate the granular trace information from the `DecisionTraceLedger` with the synthesis capabilities of the `ComplianceExport` component into a single, unified "Compliance Command Center."

---

## 6. Relevant Code References

- **Frontend Component**: [ComplianceExport.tsx](file:///c:/Users/LENOVO/Desktop/LexSovereign/components/ComplianceExport.tsx)
- **Backend Service**: [auditService.ts](file:///c:/Users/LENOVO/Desktop/LexSovereign/server/src/services/auditService.ts)
- **AI Synthesis**: [geminiService.ts](file:///c:/Users/LENOVO/Desktop/LexSovereign/services/geminiService.ts)
- **Global Control**: [GlobalControlPlane.tsx](file:///c:/Users/LENOVO/Desktop/LexSovereign/components/GlobalControlPlane.tsx)

---

**Last Updated:** 2026-02-25  
**Maintained By:** NomosDesk Engineering Team
