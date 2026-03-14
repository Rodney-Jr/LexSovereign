# MFA Implementation Blueprint: NomosDesk

This document outlines the technical strategy for implementing Multi-Factor Authentication (MFA) using Time-based One-Time Passwords (TOTP).

## 1. Objectives
- Enhance security for tenant practitioners and administrators.
- Support industry-standard TOTP apps (Google Authenticator, Microsoft Authenticator, etc.).
- Provide recovery mechanisms (Backup Codes).
- Maintain "Zero Access" security by ensuring MFA is verified within the authenticated enclave.

## 2. Technical Stack
- **Backend (Node.js)**: 
  - `otplib`: For secret generation and OTP verification.
  - `qrcode`: For generating setup QR codes.
- **Frontend (React)**:
  - Custom MFA modal for setup.
  - Verification step integrated into the `Login` flow.
- **Database (Prisma)**:
  - `User.mfaEnabled`: Boolean flag.
  - `User.mfaSecret`: Encrypted/Hashed secret.
  - `User.mfaBackupCodes`: Hashed JSON array of recovery codes.

## 3. Workflow Implementation

### Step 1: MFA Setup (Settings)
1. **Request Setup**: User clicks "Enable MFA" in Sovereign Settings.
2. **Generate Secret**: Server generates a TOTP secret using `otplib`.
3. **QR Code Generator**: Server returns a `otpauth://` URI and a Base64 QR code.
4. **Verification**: User scans and enters the first 6-digit code.
5. **Activation**: Server verifies the code; if valid, it saves the secret and enables `mfaEnabled`.
6. **Backup Codes**: Server generates 10 single-use backup codes and displays them to the user (once).

### Step 2: MFA Authentication (Login)
1. **Primary Login**: User enters email/password.
2. **Partial Auth**: Server checks `mfaEnabled`. If true, returns a 200 response with `mfaRequired: true` and a short-lived `mfaToken`.
3. **MFA Challenge**: Frontend displays a "Enter Security Code" screen.
4. **Verification**: Frontend sends code + `mfaToken` to `/api/auth/mfa/verify`.
5. **Full Auth**: Server verifies TOTP or Backup Code. If valid, issues the full session JWT/Cookie.

## 4. Proposed API Endpoints

### `POST /api/auth/mfa/setup`
- **Auth**: Required
- **Returns**: `qrCode` (Base64), `secret` (for manual entry).

### `POST /api/auth/mfa/enable`
- **Auth**: Required
- **Body**: `{ code: string }`
- **Returns**: `backupCodes: string[]` (only once).

### `POST /api/auth/mfa/verify` (Login Flow)
- **Auth**: Short-lived `mfaToken`
- **Body**: `{ code: string, mfaToken: string }`
- **Returns**: Full User Object + Session Token.

### `POST /api/auth/mfa/disable`
- **Auth**: Required + Current Password check.

## 5. Security Considerations
- **Secret Encryption**: Store the `mfaSecret` encrypted in the database using the system key.
- **Rate Limiting**: Apply aggressive rate limiting (e.g., 5 attempts / 15 mins) to verification endpoints.
- **Session Isolation**: The `mfaToken` should only grant access to the verification endpoint, not the full API.
- **Revocation**: Automatically disable MFA if a user's password is reset by a Global Admin (or require a secondary verification).

## 6. Implementation Checklist
- [ ] Add `MfaService.ts` to `server/src/services`.
- [ ] Implement setup and verification routes in `auth.ts`.
- [ ] Create `MfaSetupModal.tsx` in `frontend/src/components`.
- [ ] Update `Login.tsx` to handle the `mfaRequired` response.
- [ ] Add Audit Logs for MFA activation, deactivation, and failure.
