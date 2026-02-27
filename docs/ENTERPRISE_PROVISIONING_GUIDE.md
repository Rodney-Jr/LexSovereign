This guide provides technical specifications and operational workflows for provisioning the **NomosDesk Enterprise Tier**. Our architecture is built on the **Sovereign Integrity Promise**: every tenant operates within a cryptographically isolated **Silo**, which is physically mapped to a trusted **Regional Datacenter** to ensure absolute Data Residency compliance.

> [!IMPORTANT]
> For a detailed mapping of jurisdictional Silos to physical Railway datacenters, refer to the [RAILWAY_SILO_MAPPING.md](file:///c:/Users/LENOVO/Desktop/LexSovereign/docs/RAILWAY_SILO_MAPPING.md).

---

## 1. Online Enterprise (Cloud-First)
The Online Enterprise tier is designed for organizations requiring enterprise-grade scale with the security of **Logical Sovereignty**.

### Technical Architecture
- **Infrastructure**: Shared cloud infrastructure with software-defined tenant isolation.
- **Data Isolation**: Enforced via `tenantIsolation.ts` middleware and PostgreSQL RLS-ready schema.
- **Privacy Layer**: **DAS Proxy** (Data Access Service) intercepts AI requests to scrub PII before they leave the logical silo boundary.
- **Encryption**: AES-256-GCM using **SYSTEM_MANAGED** or **BYOK** (Bring Your Own Key) via Cloud KMS.

### Provisioning Workflow
1. **Tenant Creation**: Call `TenantService.provisionTenant` with the following parameters:
   ```typescript
   {
       plan: 'ENTERPRISE',
       appMode: 'ENTERPRISE',
       region: 'US-EAS-1' // Standard Cloud Region
   }
   ```
2. **Identity Integration**: Configure OIDC bridge (Azure AD/Okta) in the `IdentityProviders` table.
3. **Encapsulation Level**: Set to `DAS_PROXY` for automated scrubbing.

---

## 2. Sovereign Data Residency (Offline/Pinned)
The Sovereign Enterprise tier is designed for government entities, regulated financial institutions, or law firms requiring **Physical Sovereignty**.

### Technical Architecture
- **Infrastructure**: Dedicated **Sovereign Silos** pinned to specific geographical regions (e.g., `af-south-1`).
- **Isolation**: Physical or virtual air-gap depending on the security requirements.
- **Identity Protocol**: **Deterministic Key Handshake**. Authentication requires hardware-bound keys verified via ZK-Proofs.
- **Inference**: Proxied to **Local Enclaves** (local LLM nodes) to ensure zero-data-egress to global APIs.

### Infrastructure Deployment (Terraform)
Provisioning starts with infrastructure-as-code to create the dedicated vault and keys:
```hcl
module "sovereign_silo" {
  source = "./terraform"
  region = "af-south-1" # Pinned Jurisdiction
  tags   = { Compliance = "DataSovereignty" }
}
```

### Provisioning Workflow
1. **Entity Pinning**: Assign the tenant to a Sovereign Region in `types.ts`:
   ```typescript
   region: 'SOV-PR-1' // Primary Sovereign Silo
   ```
2. **Hardware Enrollment**: Admin must enroll via a hardware enclave (TPM/FIDO2) to bind the first root user to the Silo HSM.
3. **Encapsulation Level**: Set to `HSM_TUNNEL` (E2EE) or `AIR_GAP`.

---

## 3. Comparison Matrix

| Feature | Online Enterprise | Sovereign Enterprise |
| :--- | :--- | :--- |
| **Hosting** | Tier-1 Cloud (Multi-tenant) | Dedicated Silo (Single-tenant) |
| **Sovereignty** | Logical Isolation | Physical/Jurisdictional Pinning |
| **AI Processing** | Cloud API + DAS Scrubber | Local Enclave / Air-Gapped |
| **Identity** | Standard OIDC + MFA | Hardware Enclave + ZK-Proof |
| **Backup** | Cloud Geo-redundant | Sovereign Vault (`SOV-SC-1`) |

---

## 4. Operational Maintenance
### Decommissioning (Sovereign Wipe)
For Sovereign Enterprise tenants, the `deleteTenant` service triggers a "Sovereign Decommission":
1. Revoke HSM Root Keys.
2. Shred S3 Sovereign Vault.
3. Mark database records as `DELETED` in the ledger.

### Auditing
All access events are recorded in the `AuditLog` with a `Identity Fragment` trace, ensuring non-repudiation even in offline environments.
