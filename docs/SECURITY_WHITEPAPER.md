# NomosDesk Security Whitepaper & Trust Center

**Last Updated:** February 2026
**Document Classification:** Public / Client-Facing

## Executive Summary
For legal professionals, absolute client confidentiality is not just a preference; it is a strict ethical and legal obligation. NomosDesk is engineered from the ground up to protect highly sensitive legal work product. Our architecture is designed to align with stringent international standards, providing verifiable security mechanisms that empower firms to confidently manage their mandates.

This whitepaper outlines the core pillars of the NomosDesk security apparatus: Encryption, Access Control, Data Isolation, Incident Response, and Subprocessor Management.

---

## 1. Encryption Architecture

NomosDesk employs defense-in-depth encryption strategies to ensure data remains unreadable to unauthorized entities at all times.

### 1.1 Encryption at Rest
All persistent data, including the core PostgreSQL database and associated document blob storage, is encrypted at rest using **AES-256** (Advanced Encryption Standard). Volume-level encryption ensures that physical compromise of storage media yields no intelligible data.

### 1.2 Encryption in Transit
All communications between the client application and the NomosDesk Sovereign Control Plane are secured using **TLS 1.3** (Transport Layer Security). This prevents man-in-the-middle (MitM) attacks and ensures payload integrity during transit.

### 1.3 Key Management & BYOK Architecture
NomosDesk's architecture is built to support Hardware Security Module (HSM) integrations and Bring Your Own Key (BYOK) paradigms. This ensures that the encryption keys used to secure tenant silos are managed with cryptographic rigor, isolating tenant data even from NomosDesk platform administrators.

---

## 2. Access Controls & Auditability

To prevent unauthorized horizontal or vertical access, NomosDesk enforces strict authentication and authorization gateways.

### 2.1 Role-Based Access Control (RBAC)
Access is governed by a granular, centralized RBAC engine. Identity properties and permissions are heavily enforced at the API routing layer through our `sovereignGuard` middleware. This ensures that users—whether internal Firm personnel or external Clients—can only access documents and matters explicitly authorized for their role.

### 2.2 Multi-Factor Authentication (MFA)
To mitigate the risk of compromised credentials, NomosDesk natively supports and enforces **TOTP-based Multi-Factor Authentication**. High-privilege actions and sensitive document access require verified MFA sessions.

### 2.3 Immutable Audit Logging
Maintaining a clear chain of custody is paramount. The platform maintains an immutable Decision Trace Ledger (`/api/audit`). Every read, write, and administrative action is logged with accurate timestamps, user vectors, and specific resource IDs, providing complete repudiation defense and transparent oversight.

---

## 3. Data Isolation & Segregation

NomosDesk does not operate a traditional multi-tenant monolithic database where client data co-mingles freely. We employ "Sovereign Silos."

### 3.1 Sovereign Silos
Each firm (Tenant) is provisioned within a logically isolated Sovereign Silo. Data access queries are automatically scoped to the user's validated tenant context at the database layer, mathematically guaranteeing that cross-tenant data leakage cannot occur.

### 3.2 Departmental Firewalls (Chinese Walls)
Within a single Sovereign Silo, NomosDesk supports configurable "Chinese Walls." This allows agencies and large firms to enforce strict departmental segregation (e.g., isolating Prosecution teams from Investigation teams), ensuring internal conflicts of interest are structurally prevented.

### 3.3 Regional Anchoring
To align with global data sovereignty requirements, tenants are anchored to specific regional datacenters (e.g., `GH_ACC_1`). Compute and storage resources remain within these boundaries, keeping jurisdictional control clear and predictable.

---

## 4. Incident Response Protocol

NomosDesk maintains a proactive security stance designed to identify and mitigate threats rapidly.

- **Continuous Monitoring:** Production environments are continuously monitored for anomalous activity, unauthorized access attempts, and resource spikes.
- **Threat Mitigation:** In the event of a suspected breach, the affected Sovereign Silos can be instantly isolated or "frozen."
- **Notification:** Our incident response procedures are designed to notify affected Tenant Administrators within 72 hours of a confirmed data incident, providing the necessary details for the firm to fulfill its own breach notification obligations.

---

## 5. Compliance Alignment & Legal Frameworks

NomosDesk understands that our clients operate under complex regulatory regimes. Our platform architecture, operational procedures, and data handling practices are **designed in strict alignment** with major global security and privacy frameworks.

While we are continuously evolving our formal certification roadmap, our infrastructure currently maps to the functional requirements of:
- **SOC 2 Type II:** Our systems reflect the Trust Services Criteria for Security, Availability, and Confidentiality through access controls, audit trails, and encryption.
- **ISO/IEC 27001:** Information security management principles are baked into our development lifecycle and operational protocols.
- **GDPR & DPA:** We adhere to the principles of data minimization, purpose limitation, and storage limitation. Our architecture is built to support the rapid execution of Data Processing Agreements (DPAs) and to facilitate data subject requests (Right to Erasure/Access).

---

## 6. Subprocessors & Supply Chain

To deliver our services, NomosDesk utilizes carefully vetted third-party infrastructure. We ensure our subprocessors maintain security postures equivalent to or exceeding our own.

### 6.1 Hosting & Infrastructure
Core hosting and database services are currently orchestrated via **Railway**. Railway maintains robust physical and network security across its regional deployments.

### 6.2 Artificial Intelligence Providers
NomosDesk leverages advanced AI inference through unified gateways like **OpenRouter**, as well as local edge models.
- **Zero Data Retention:** We strictly utilize API endpoints configured for zero continuous data training. Client PII and Legal Work Product are *never* used to train public foundation models.
- PII scrubbing occurs before payloads are transmitted to external AI inference engines.

---
*For specific compliance inquiries or to request a Data Processing Agreement, please contact our security team.*
