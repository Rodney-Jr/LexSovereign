# LexSovereign — Login Scenario Workflows

> **Files Involved**
> - `components/AuthFlow.tsx` — Login UI
> - `components/AppRouter.tsx` — Entry-point router (decides which screen to show)
> - `hooks/useAuth.ts` — Firebase sync + session hydration logic
> - `contexts/AuthContext.tsx` — Firebase auth state listener
> - `contexts/SovereignContext.tsx` — App-level session state
> - `server/src/routes/auth.ts` — Backend auth endpoints
> - `server/src/middleware/auth.ts` — `authenticateToken` middleware

---

## Scenario Map

The `AppRouter` acts as the gatekeeper. On every render it evaluates a priority chain:

| Check | Screen Rendered |
|---|---|
| `isOnboarding` | `TenantOnboarding` — new firm signup |
| `isUserInvitation` | `TenantUserOnboarding` — invite link flow |
| `isResettingPassword` | `ResetPassword` — password reset token |
| `!isAuthenticated` + `isPlatformMode` | `PlatformGateway` — GLOBAL_ADMIN secret portal |
| `!isAuthenticated` | `AuthFlow` — standard login screen |
| `isAuthenticated ✓` | `Layout` + all App Routes |

---

## Scenario 1 — Email / Password Login (Standard)

**Entry Point:** `AuthFlow.tsx → handleSubmit()`

```
User fills email + password
  → firebase.signInWithEmailAndPassword(auth, email, password)
  → Firebase SDK resolves → auth state change fires in AuthContext
  → AuthContext.onAuthStateChanged sets user (FirebaseUser)
  → useAuth detects user change → syncSession() runs
      → user.getIdToken() fetches a fresh Firebase ID Token
      → GET /api/auth/me  { Authorization: Bearer <idToken> }
      → Backend: authenticateToken → verifyIdToken() → DB lookup by firebaseUid
      → Returns { user: { id, email, name, role, tenantId, permissions, mode } }
  → handleAuthenticated(session) stores session to localStorage
  → SovereignContext.setSession() sets app-level session
  → isAuthenticated = true → AppRouter renders Layout
```

> ⚠️ Raw passwords **never touch** the NomosDesk backend. Firebase handles credential
> storage entirely. The backend only ever sees a verified Firebase ID Token.

---

## Scenario 2 — Google SSO Login

**Entry Point:** `AuthFlow.tsx → handleGoogleLogin()`

```
User clicks "Google Authority"
  → signInWithRedirect(auth, GoogleAuthProvider)   [Primary: navigates to Google]
      On return: AuthContext.handleRedirect() catches getRedirectResult()
  OR  signInWithPopup(auth, provider)              [Fallback if redirect fails]
  → Firebase auth state change fires
  → Same syncSession() pipeline as Scenario 1
```

> The backend may use the **email-link resiliency path** if the Google UID was never
> stored locally (e.g. user previously used email/password). In that case, the middleware
> finds the user by email and updates their `firebaseUid` transparently.

---

## Scenario 3 — Invitation / Join-Silo Flow

**Entry Point:** URL `?token=SOV-INV-XXXX` or path `/join`

```
App load detects token in URL params
  → setIsUserInvitation(true)
  → AppRouter renders TenantUserOnboarding

TenantUserOnboarding:
  → POST /api/auth/resolve-invite { token }
      <- { email, roleName, tenantName, tenantMode }
  → User sets their name + password
  → POST /api/auth/join-silo { token, name, password }
      → Backend: Firebase Admin createUser (email + password)
      → Prisma tx:
          * Lookup role (tenant-specific, then system fallback)
          * Create User record: firebaseUid, roleId, tenantId, region
          * Mark invitation as isUsed: true
  → Session saved to localStorage
  → AppRouter.onComplete() reads session → calls handleAuthenticated()
  → setIsUserInvitation(false) → normal authenticated Layout
```

---

## Scenario 4 — New Firm Onboarding (First-Time Admin)

**Entry Point:** URL `?plan=Starter` OR clicking "Provision New Silo" in AuthFlow

```
App load detects plan param OR onStartOnboarding()
  → setIsOnboarding(true)
  → AppRouter renders TenantOnboarding

TenantOnboarding:
  → (Optionally) retrieves and validates Stripe Checkout session
  → POST /api/auth/onboard-silo
      → Stripe session verified (payment_status checked)
      → Prisma tx:
          * Create Tenant (name, plan, appMode, region, stripeData)
          * Lookup system TENANT_ADMIN role (isSystem: true)
          * Firebase Admin: createUser for admin account
          * Create User record (firebaseUid, TENANT_ADMIN, tenantId)
      → Stripe subscription quantity synced asynchronously
      → Welcome email dispatched asynchronously
  → User clicks complete → handleInceptionComplete(mode)
  → setIsOnboarding(false) → AuthFlow shown (user must sign in)
```

---

## Scenario 5 — Global Admin / Platform Gateway (Secret Entry)

**Entry Point:** Clicking the Shield logo **5 times** on the login screen

```
5th logo click → onSecretTrigger() → setIsPlatformMode(true)
  → AppRouter renders PlatformGateway (admin-only login portal)
  → PlatformGateway authenticates and calls handleAuthenticated() on success
  → isAuthenticated = true → Layout rendered with GLOBAL_ADMIN context
```

---

## Backend: `authenticateToken` Middleware — Dual-Token Strategy

Every protected API call runs through this middleware (`server/src/middleware/auth.ts`):

```
Incoming request
  → Read token from:
      1. HttpOnly Cookie "token"  (hardened primary)
      2. Authorization: Bearer header  (legacy / API compatibility)
  → If no token → 401 Unauthorized

  ┌─ Path A: Firebase Verification (Primary) ─────────────────────────────────┐
  │  firebaseAdmin.auth().verifyIdToken(token)                                 │
  │  → lookup user by firebaseUid in DB                                        │
  │  → If not found (UID mismatch):                                            │
  │      attempt email-based link recovery                                     │
  │      → find user by decodedToken.email                                     │
  │      → update user.firebaseUid → link account                              │
  │  → If still not found → 401 { error: 'User not synchronized' }            │
  │  → Populate req.user from DB record                                        │
  └────────────────────────────────────────────────────────────────────────────┘
  ┌─ Path B: Legacy JWT Fallback (Admin Impersonation) ────────────────────────┐
  │  jwt.verify(token, JWT_SECRET)                                              │
  │  → Populate req.user from JWT claims                                        │
  │  → isImpersonating flag preserved                                           │
  └────────────────────────────────────────────────────────────────────────────┘

  [Account Status Checks — for non-impersonation sessions]
    → user.isActive === false → 403 Account disabled
    → tenant.status === 'SUSPENDED' → 403 Tenant suspended

  → requestContext.run({ tenantId, userId }, next)
```

---

## Session Hydration on Page Reload

```
App mounts (cold load / refresh)
  → SovereignContext reads localStorage('nomosdesk_session')
  → If found: setSession(saved) → UI renders immediately as authenticated (optimistic)
  → AuthContext.onAuthStateChanged fires → Firebase user loaded
  → useAuth.syncSession() re-validates: GET /api/auth/me with fresh ID token
  → Session refreshed in localStorage with latest role, permissions, mode
```

> If re-validation returns 401 or 403, `handleLogout()` is triggered automatically,
> clearing state and redirecting to the login screen.

---

## Logout

```
User clicks Logout
  → handleLogout() in hooks/useAuth.ts
      1. firebaseSignOut(auth)                  → kills Firebase session
      2. POST /api/auth/logout (non-blocking)   → server clears HttpOnly cookie
      3. Clear localStorage:
            nomosdesk_session
            nomosdesk_pin
            nomosdesk_activeTab
      4. Clear sessionStorage: nomosdesk_session
      5. window.location.href = '/'             → hard redirect to AuthFlow
```

**Automatic logout also triggered by:**

| Trigger | Source |
|---|---|
| `window` event `nomosdesk-auth-failed` | Any API call returning 401 |
| 30-minute inactivity timeout | `useInactivityLogout` hook |
| Backend 403: Account disabled | `authenticateToken` middleware |
| Backend 403: Tenant suspended | `authenticateToken` middleware |

---

## Password Reset

**Path A — Firebase Native (Forgot Password link in AuthFlow):**

```
User clicks "Forgot Password?"
  → isForgotPassword = true → shows reset email form
  → sendPasswordResetEmail(auth, email)  [Firebase sends link]
  → UI shows confirmation: "Link Injected Into System Logs"
```

**Path B — Custom Token Reset (URL `?resetToken=...`):**

```
URL detected on load → setIsResettingPassword(true)
  → AppRouter renders ResetPassword component
  → User submits new password with the token
  → On complete: URL cleaned via history.replaceState
  → AppRouter returns to AuthFlow (user signs in normally)
```

---

## Role → Permission Resolution (Post-Login)

```
handleAuthenticated(session) called
  → normalizedRole = session.role.toUpperCase()
  → activePermissions = ROLE_DEFAULT_PERMISSIONS[normalizedRole]
                        OR session.permissions from /api/auth/me
  → localStorage: 'nomosdesk_session' saved with normalized values
  → Fetch PIN from GET /api/auth/pin → localStorage: 'nomosdesk_pin'
  → PermissionProvider context updated:
      setRole(normalizedRole)
      setPermissions(activePermissions)
      setEnabledModules(session.enabledModules)
  → canAccessTab(), checkVisibility(), hasPermission() now active
```

---

## Studio Token Handoff

When navigating to the Drafting Studio, a short-lived handoff token is issued:

```
POST /api/auth/studio-token  (requires valid session)
  → jwt.sign({ id, tenantId, role, email, name, permissions, type: 'STUDIO_HANDOFF' })
  → Expires in 15 minutes
  → Studio uses this token independently for its own auth context
```
