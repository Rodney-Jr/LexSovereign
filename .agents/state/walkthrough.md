# NomosDesk: Security & Hardening Walkthrough

This document summarizes the technical enhancements and critical fixes applied to the NomosDesk platform to ensure architectural sovereignty and development stability.

## Phase 2: Zero Access & Advanced Security

### 1. Zero Access Tenant Isolation
Global Administrators can no longer see raw tenant data (matters, documents) by default. Their context is strictly bound to the `__PLATFORM__` silo, which is isolated from all tenant enclaves.

### 2. API Rate Limiting
- **Standard Limiter**: Applied to all `/api` routes (500 requests / 15 mins).
- **Auth Limiter**: Stricter policy on `/api/auth/login` (20 attempts / 15 mins).

### 3. Document Read Auditing
Injected logging into `server/src/routes/documents.ts` to log every access to document content and metadata (`DOCUMENT_CONTENT_READ`, `DOCUMENT_METADATA_READ`).

### 4. Consent-Driven Support Impersonation
- **Grant**: Tenant Admin navigates to **Settings > Access Governance** and clicks **Grant Support Access** (1-hour window).
- **Assume**: Platform Admin assumes context via `/api/admin/support/assume`.
- **Safety**: Auth middleware verifies the grant in real-time.

## Phase 4: Debugging & Hardening

### 1. JSON Parsing Robustness
**Issue:** Frontend threw `Unexpected end of JSON input` on connection interruptions.
**Fix:** Hardened `authorizedFetch` in `utils/api.ts` to check `response.text()` before parsing.

### 2. Pricing Modal Fixed
**Issue:** `TypeError: config.features.map is not a function` in plan selection.
**Fix:** Added defensive `Array.isArray` checks for feature lists in `PricingGovernance` and `TenantOnboarding`.

### 3. Prisma Engine Lock Resolved
**Issue:** `EPERM` errors during `npx prisma db push`.
**Fix:** Cleared stale `node.exe` processes locking the binary and successfully synchronized the schema.

## Phase 5: Unified Development Experience

### 1. One-Command Startup
**Issue:** Frontend and Backend had to be started separately, leading to proxy 500 errors when the backend was forgotten.
**Fix:** Added `concurrently` and a `dev:all` script to the root `package.json`.
**Command:** `npm run dev:all` (Starts Vite and Backend simultaneously).

### 2. Login Route Hardening
**Issue:** Malformed or empty login requests triggered 500 Internal Server Errors.
**Fix:** Updated `server/src/routes/auth.ts` to return `400 Bad Request` for missing email/password.

## Verification Checklist

- [x] **Connectivity:** `npm run dev:all` verified to start both services.
- [x] **Rate Limiting:** Verified 429 responses return valid JSON.
- [x] **Read Auditing:** `DOCUMENT_CONTENT_READ` logs verified in database.
- [x] **Hardening:** Login and Pricing components verified as crash-resistant.
- [x] **Zero Access:** Verified via `verify-isolation.ts` that `__PLATFORM__` scope sees **zero** tenant records across all restricted models.

---
**Operation Successful. Ready for full-stack orchestration.**
> [!TIP]
> Run `npm install` in the root directory first to install the new `concurrently` dependency.
