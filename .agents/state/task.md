# Task Checklist: Sovereign Desktop Agent & Platform Hardening

## Phase 1-5: Desktop Agent & Ingestion Hub
- [x] API Key Infrastructure (CRUD & Node Client Auth).
- [x] Ingestion Route with automated compliance scanning.
- [x] Frontend Agent Sync Dashboard.
- [x] Node.js Standard Daemon (`nomosdesk-agent`).
- [x] Verification with physical file-move lifecycle.

## Phase 6: Dossier Differentiation
- [x] Role-based tab rendering in `SovereignStaffDossierModal.tsx`.
- [x] Separate Client modules (Matters, Billing, Vault).
- [x] KYC Status and HR field masking.

## Phase 7: Data Residency & Sovereignty
- [x] Prisma schema jurisdictional pins.
- [x] StorageRouter for regional bucket isolation.
- [x] SovereignEnclave AI routing.
- [x] Integrated Sovereignty UI for Tenant Settings.

## Phase 8: Sovereign AI Agent Advanced Controls
- [x] Global Admin Dashboard Access fix for Tenant Settings (JS ReferenceError fixed).
- [x] Implement Targeted Tenant Management for Platform Admins (`targetTenantId` overrides).
- [ ] Implement per-matter processing priority.
- [ ] Add regional GPU cluster health monitoring to dashboard.
- [ ] Create automated residency compliance audit reports.

### March 17: Structural Maturity Migration (Completed)
Implemented a scalable, route-driven architecture covering all core modules.
- **SovereignContext**: Centralized authentication and permission logic.
- **Router-First Navigation**: Full transition to `react-router-dom` for URL-addressable state.
- **Dossier & Vault Workspaces**: Migrated complex modals into deep-linkable full-page views.
- **Navigation Context**: Integrated `Breadcrumbs` and Global Search for enhanced UX.
- **State Recovery**: Standardized scroll restoration and deep-link persistence.
- **Build Verification**: Confirmed integrity via successful `npm run build`.

## Phase 9: Structural Maturity (Planned)
- [x] Phase 1: Unified Identity & Permissions Logic (SovereignContext).
- [x] Phase 2: Router-First Navigation (react-router-dom integration).
- [x] Phase 3: Workspace Migration (Staff Dossier & Settings).
- [x] Phase 4: Dynamic Breadcrumbs & Search Integration.
- [x] Phase 5: Persistence & State Recovery Hardening.
