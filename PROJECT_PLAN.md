# NomosDesk Project Plan

## Current Sprint: Document Ecosystem & UI Hardening
Target: Seamless document lifecycle from vault to drafting.

- [x] **Document Association Refinement**
    - [x] Relocate "Change Matter" for better discoverability.
    - [x] Fix `PATCH` endpoint to handle `matterId` updates.
- [x] **Matter Activity Ledger Integration**
    - [x] Merge documents into `MatterIntelligence` activity feed.
    - [x] Implement "Edit Artifact" button/double-click navigation.
    - [x] Fix RBAC permission bottlenecks for Admin roles.
- [x] **UI Polish & Accessibility**
    - [x] Fix `FileUploader.tsx` form label lints.
    - [x] Migrate inline styles in `SovereignStaffDossierModal.tsx` to CSS modules/classes.

## Backlog
- [x] Implement multi-document selection in Vault.
- [x] Add version history preview to the Ledger. (Verified with Visual Demo)
- [x] Integrate Ghana Sentinel for automated compliance marking on doc upload.
