# NomosDesk Project Plan

## Tech Stack Constraints
- **Frontend**: React (Vite), Tailwind CSS (for most, though some legacy inline styles exist), Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Security**: Sovereign Silo architecture, BYOK Encryption, Enclave-based document storage.
- **AI**: Gemini Thinking Engine (LexGeminiService).

## Active Sprint: Document Ecosystem & UI Hardening
**Goal**: Finalize document lifecycle and association workflows before first 10-client pilot.

### Active Tasks
- [/] **Matter Activity Ledger Integration**
    - [ ] Display matter-associated documents in the `MatterActivityLedger` (within `MatterIntelligence.tsx`).
    - [ ] Implement double-click on document entries to launch `DraftingStudio` directly.
- [ ] **UI Polish & Linting Fixes**
    - [ ] Resolve accessibility lints in `FileUploader.tsx`.
    - [ ] Migrate inline styles in `SovereignStaffDossierModal.tsx` to CSS modules/Tailwind.

## Completed Tasks
- [x] **Document Association Enhancements**
    - [x] Corrected `LegalDrafting.tsx` to use dynamic `matterId`.
    - [x] Updated `PATCH /api/documents/:id` to support `matterId` updates.
    - [x] Implemented "Change Matter" UI in `DocumentVault.tsx` (relocated to Actions).
- [x] **Matter Inception Hardening**
    - [x] Fixed "Missing required fields" crash in `MatterCreationModal.tsx`.
    - [x] Added frontend validation and visual required indicators (*).
    - [x] Made practitioner assignment optional during inception.
- [x] **Stability Fixes**
    - [x] Fixed missing `LexGeminiService` reference in `DocumentVault.tsx`.
    - [x] Resolved React `key` prop warnings in lists.

## Backlog
- [ ] Full General Ledger & Trust Ledger implementation in Accounting module.
- [ ] Real-time document collaboration via Enclave Silos.
- [ ] ZK Conflict Search optimization.
