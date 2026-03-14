# Security Enhancements Implementation Plan

This plan details the technical approach for implementing requested security features: temporary impersonation, read-auditing for sensitive documents, and API rate-limiting.

## User Review Required
> [!WARNING]
> The **Impersonation Support** requires a change to the database schema (`schema.prisma`) to track active impersonation grants. This will require a Prisma migration (`npx prisma db push` or `migrate dev`).

## Proposed Changes

### 1. API Rate Limiting (Brute Force Protection)
We will expand the usage of `express-rate-limit` to protect the backend from abuse.
#### [MODIFY] server/src/index.ts
- Create and apply a `standardApiLimiter` to the base `/api` catchall (e.g., 500 requests per 15 mins).
- Keep the existing `authRateLimiter` but tighten it specifically for `/api/auth/login` and `/api/auth/reset` (e.g., 20 requests per 15 mins).

### 2. Read Auditing for Documents 
We need to generate an `AuditLog` entry whenever a user views the content of a document, especially if it's marked as Confidential.
#### [MODIFY] server/src/routes/documents.ts
- In `GET /:id/content` and `GET /:id`, inject a call to `prisma.auditLog.create`.
- The log action will be `DOCUMENT_ACCESSED` or `DOCUMENT_READ`.
- We will include the user's ID, the document ID, and the matter ID in the audit record.

### 3. Support Impersonation (Zero Access Override)
To allow Global Admins to troubleshoot tenant issues, we need a consent-driven impersonation flow.
#### [MODIFY] server/prisma/schema.prisma
- Add a new model: `SupportAccessGrant`
  - Fields: `id`, `tenantId`, `grantedByUserId`, `expiresAt`, `createdAt`
#### [NEW] server/src/routes/support.ts (or add to `tenant.ts` / `admin.ts`)
- **[POST] /grant**: For `TENANT_ADMIN` to create a `SupportAccessGrant` valid for 1 hour.
- **[POST] /assume**: For `GLOBAL_ADMIN` to exchange their global token for a temporary tenant-scoped token linked to the active grant.
#### [MODIFY] server/src/middleware/auth.ts
- Update token generation and verification to handle "Impersonated Tokens", where `req.user.tenantId` matches the tenant, but we log the true identity (`req.user.impersonatorId`).
#### [MODIFY] components/SettingsGovernance.tsx
- Add a UI toggle for "Grant NomosDesk Support Access (1 Hour)" sending a request to the new endpoint.

### 4. Zero Access Hardening (Global Admin Restriction)
To ensure Global Admins cannot see tenant data without active impersonation, we will apply the following:

#### [MODIFY] server/prisma/schema.prisma
- Add `tenantId String?` to `AuditLog`.
- Add `tenantId String` to `Document`.
- Add `tenantId String` to `TimeEntry`, `Task`, `Deadline`, `CollaborationMessage`.
- *Rationale*: Allows the isolation middleware to filter these records directly without joining to `Matter`.

#### [MODIFY] server/src/middleware/tenantIsolation.ts
- Expand `ISOLATED_MODELS` to include ALL tenant-specific models: `Document`, `AuditLog`, `TimeEntry`, `Task`, `Deadline`, `CollaborationMessage`, `ActivityEntry`, `AIUsage`, `Invoice`, `BrandingProfile`, `Department`, `AIRiskAnalysis`, `ContractMetadata`, `CaseMetadata`, `EvidenceLink`, `Hearing`, `Approval`, `PredictiveRisk`.

#### [MODIFY] server/src/routes/platform.ts
- **[GET] /audit-logs**: Filter to only show platform-level logs (`tenantId` is null or specific to support).
- **[GET] /stats**: Aggregate data to show counts only, no descriptive leakages.

#### [MODIFY] server/src/scripts/seed.ts
- Ensure `AuditLog` and `Document` creation calls include the `tenantId`.

## Verification Plan

### Automated/Local Tests
- `npx prisma db push` to apply schema changes.
- Verify `tenantIsolationMiddleware` correctly filters `AuditLog.findMany` when called by a user.

### Manual Verification
- **Global Admin Isolation:** Log in as Global Admin, navigate to the Control Plane "Security Pulse" (Audit Logs). Verify you **cannot** see "Acme Corp Merger" logs unless you have assumed that tenant's context.
