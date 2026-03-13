# NomosDesk Security Architecture: Section 2

## Data Encryption & Authorization Architecture

### 1. Protocol Standards & Transit Security

NomosDesk enforces strict transit security to ensure that all data moving between the client application and the Sovereign Vault is protected against interception and tampering.

*   **HTTPS Enforced:** All intra-service and client-to-server communication mandates HTTPS.
*   **Helmet Headers:** The application employs `helmet` to automatically inject hardened HTTP headers, preventing common attack vectors like Cross-Site Scripting (XSS), Clickjacking, and MIME-sniffing.
*   **Strict Content Security Policy (CSP):** The API explicitly whitelists valid origins (`'self'`, Google Accounts for SSO) to prevent unauthorized script execution or data exfiltration.

### 2. Cryptographic Primitives & At-Rest Security

NomosDesk requires rigorous cryptographic standards for identity management and data-at-rest protection.

*   **Password Hashing:** User passwords are encrypted universally using the `bcrypt` algorithm. The implementation standardizes on **10 salt rounds**, offering a robust defense against brute-force and rainbow table attacks while maintaining acceptable login latency.
*   **Database Constraints:** The PostgreSQL implementation natively enforces unique constraints, preventing credential collisions or race-condition provisioning.

### 3. Token Lifecycle & Authentication Protocol

The NomosDesk platform uses a stateless, token-based architecture to verify identity while minimizing database overhead during high-frequency API calls.

*   **Stateless JWT Sessions:** Upon successful authentication, the system issues a JSON Web Token (JWT) signed with a securely injected server-side secret (`JWT_SECRET`).
*   **Strict Expiration:** Standard session tokens are strictly scoped to an **8-hour lifespan**, forcing re-authentication to mitigate the risk of hijacked, long-lived sessions.
*   **MFA (Two-Step Verification):** For accounts with Multi-Factor Authentication enabled, the system issues a temporary, severely restricted token (10-minute validity) strictly purposed for Phase 2 verification.
*   **Role-Based Access Control (RBAC):** The JWT payload rigidly encodes the user's explicit permissions and tenant isolation boundaries (Silo ID), which are cryptographically signed. The middleware (`requireRole`, `sovereignGuard`) intercepts requests to validate these boundaries before execution. 

---

### 🛡️ Planned Hardening Tasks (Pre-Pilot)

Based on the architectural review, the following hardening tasks should be prioritized before opening the Founding Cohort pilot:

1.  **Secure Cookie Transport:** The current implementation passes the JWT via the `Authorization: Bearer <token>` header, likely stored in `localStorage` on the client. We should migrate to passing the JWT via `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent token extraction via XSS.
2.  **Secret Rotation Strategy:** Ensure `JWT_SECRET` is rotated periodically and that the system supports graceful key rollover.
3.  **Rate Limiting:** Implement strict rate-limiting on the `/api/auth/login` and `/api/auth/register` endpoints to thwart automated credential stuffing attacks.
