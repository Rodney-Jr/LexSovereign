# Task Checklist: Security Enhancements

## Phase 1: API Rate Limiting (Enhancement 3)
- [x] Add `express-rate-limit` dependency to server.
- [x] Create `server/src/middleware/rateLimiter.ts`. (Implemented in index.ts)
- [x] Apply strict rate-limiting to auth routes (`/api/auth/login`, `/api/auth/reset`).
- [x] Apply standard rate-limiting to high-traffic API routes.

## Phase 2: Read Auditing (Enhancement 2)
- [x] Update `server/src/routes/documents.ts` to log an `AuditLog` entry when `/:id/content` or `/:id` is accessed.
- [x] Differentiate between standard access and 'Strictly Confidential' document access.
- [x] Make sure viewing notes or intelligence creates an audit trail if legally significant.

## Phase 3: Support Impersonation (Enhancement 1)
- [x] Create `SupportAccessGrant` Model in Prisma
- [x] Real-time Impersonation Lockout Logic in `auth.ts`
- [x] Platform Admin "Assume Context" Dashboard
- [x] Global Tenant Decommissioning Trigger

## Phase 4: Debugging & Critical Hardening
- [x] Resolve `Unexpected end of JSON input` in `authorizedFetch`
- [x] Fix `TypeError: config.features.map` in Pricing and Onboarding
- [x] Resolve Prisma Engine `EPERM` Lock issue
- [x] Verify API Rate Limit JSON Response Structure

## Phase 5: Unified Development Experience
- [x] Add `dev:all` script to root `package.json` for concurrent startup.
- [x] Install `concurrently` in root directory.
- [x] Harden backend login route against malformed/empty bodies (Return 400).
- [x] Finalized walkthrough with Phase 5 details.

## Phase 6: Zero Access Hardening
- [x] Add `tenantId` to `Document`, `AuditLog`, `Task`, `Deadline`, `TimeEntry` in `schema.prisma`.
- [x] Run `npx prisma db push` to apply schema changes.
- [x] Expand `ISOLATED_MODELS` in `tenantIsolationMiddleware.ts`.
- [x] Restrict Global Admin access in `server/src/routes/platform.ts` (`/stats`, `/audit-logs`).
- [x] Update `seed.ts` to populate `tenantId` for secondary models.
- [x] Verify Global Admin cannot see tenant data without impersonation.

## Phase 7: MFA Implementation Planning
- [x] Draft MFA Implementation Plan (`mfa_implementation_plan.md`).
- [ ] Review plan with user.
