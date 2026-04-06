# NomosDesk — Native Auth & Identity Workflows

NomosDesk uses a **Sovereign Native Identity** system built on JWT, WebAuthn (Passkeys), and MSAL (Microsoft/OpenID). Firebase has been completely removed to ensure data sovereignty and control.

---

## 1. Login Scenarios

### Scenario 1 — Native Password Login
Standard email and password authentication stored securely in the NomosDesk database.

**Flow:**
1. User enters Email + Password in `AuthFlow.tsx`.
2. `POST /api/auth/login` sends credentials to the backend.
3. Backend fetches user, verifies `bcrypt` hash of the password.
4. If valid, backend issues a **Native JWT** and sets it as an `HttpOnly` secure cookie.
5. Frontend receives user profile metadata and initiates session hydration.

### Scenario 2 — Passkey (WebAuthn)
Modern biometric/hardware-backed authentication (Windows Hello, FaceID, YubiKey).

**Flow:**
1. User enters email and clicks "Passkey".
2. `GET /api/auth/webauthn/login/generate` fetches challenge options from the server.
3. Browser invokes WebAuthn API (`startAuthentication`).
4. `POST /api/auth/webauthn/login/verify` sends the signed challenge to the backend.
5. If signature is valid and matches a registered credential, backend issues a session JWT.

### Scenario 3 — Microsoft / School SSO (MSAL)
Enterprise-grade external identity integration.

**Flow:**
1. User clicks "Microsoft Work / School".
2. Browser redirects to `/api/auth/msal/init`.
3. Backend initiates OAuth2/OIDC handshake with Microsoft Entra ID.
4. On return, backend verifies the external token and matches the user by email.
5. Session JWT issued if the user belongs to an active tenant.

---

## 2. Session Architecture

### JWT Tokens
- **Primary Session**: 24-hour expiration, stored in an `HttpOnly` cookie.
- **Header Fallback**: `Authorization: Bearer <token>` for API/Studio cross-domain compatibility.
- **Payload**: Contains `id`, `tenantId`, `role`, `name`, and `permissions`.

### Hydration & Revalidation (`/api/auth/me`)
On every page reload or mount:
1. `useAuth` hook calls `GET /api/auth/me`.
2. Backend parses the JWT and fetches the latest user/tenant status from the database.
3. If the user is inactive or their tenant is suspended, the session is revoked (401/403).
4. Local storage (`nomosdesk_session`) is updated with the latest permissions.

---

## 3. Provisioning & Onboarding

### New Silo Inception
1. `TenantOnboarding.tsx` collects firm and admin details.
2. `POST /api/auth/onboard-silo` creates the Tenant and the first Global Admin record.
3. Password is set natively via `bcrypt`.
4. Resulting `adminId` and `loginUrl` are returned for immediate access.

### Internal Invitations
1. Administrator generates an invite link via `POST /api/auth/resolve-invite`.
2. New user accepts and sets their name/password via `POST /api/auth/join-silo`.
3. Logic ensures the user is linked to the correct tenant and role natively.

---

## 4. RBAC & Security Middleware

### `authenticateToken`
- Decodes the Native JWT.
- Performs mandatory **Database Active Checks** (is user still active? is tenant suspended?).
- Runs the request within a `Prisma.requestContext` for tenant-scoped safety.

### `requirePermission`
- High-level RBAC enforcement.
- Checks the user's granular permission set (e.g., `VIEW:CLIENT`) against the requested resource.
- **Global Admin Bypass**: Users with the `GLOBAL_ADMIN` role bypass resource-level checks.

---

## 5. Metadata Cleanup (Post-Migration)
- The legacy `firebaseUid` field has been removed from all Prisma models.
- All seeding and diagnostic scripts (`seed.ts`, `check_users.ts`, etc.) now check for `passwordHash` presence to ensure account security.
