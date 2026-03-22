# NomosDesk Project Plan

## Current Sprint: Structural Maturity & UX Hardening
Target: Transition from "Modal Fatigue" to professional route-driven layouts and premium document experiences.

- [x] **Drafting Studio Paging**
    - [x] Implement Zoom (40%-150%) for full-page viewing.
    - [x] Add A4 sheet stacking and CSS page breaks.
    - [x] Fix internal scrollbars via auto-resizing textareas.
- [x] **Global Admin Access Fix**
    - [x] Resolved session context issues for platform owners.
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
- [ ] Implement MFA following technical blueprint.
- [ ] Finalize Ghana Sentinel compliance automation.
- [ ] Record Full Lifecycle Demo (Kofi Adu persona).


## Backlog
- [x] Implement multi-document selection in Vault.
- [x] Add version history preview to the Ledger. (Verified with Visual Demo)
- [x] Integrate Ghana Sentinel for automated compliance marking on doc upload.
