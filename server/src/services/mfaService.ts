import { generateSecret, verifySync, generateURI } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Service for Multi-Factor Authentication (MFA) using TOTP.
 */
export class MfaService {
    /**
     * Generate a new TOTP secret for a user.
     */
    static generateSecret(): string {
        return generateSecret();
    }

    /**
     * Generate a QR code data URI for the user to scan.
     */
    static async generateQRCode(email: string, secret: string): Promise<string> {
        const otpauth = generateURI({
            issuer: 'LexSovereign',
            label: email,
            secret
        });
        return QRCode.toDataURL(otpauth);
    }

    /**
     * Verify a TOTP token against a secret.
     */
    static verifyToken(token: string, secret: string): boolean {
        try {
            const result = verifySync({ token, secret });
            return result.valid;
        } catch (error) {
            console.error('[MFA] Verification Error:', error);
            return false;
        }
    }

    /**
     * Generate a set of hashed backup codes for recovery.
     * Returns 10 plaintext codes (to show once) and their hashed versions (to store).
     */
    static generateBackupCodes(): { plaintext: string[]; hashed: string[] } {
        const plaintext: string[] = [];
        const hashed: string[] = [];

        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
            plaintext.push(code);
            hashed.push(crypto.createHash('sha256').update(code).digest('hex'));
        }

        return { plaintext, hashed };
    }

    /**
     * Verify a backup code against a list of hashed codes.
     */
    static verifyBackupCode(code: string, hashedCodes: string[]): { isValid: boolean; updatedCodes: string[] } {
        const hashedInput = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
        const index = hashedCodes.indexOf(hashedInput);

        if (index !== -1) {
            // Remove the used code
            const updatedCodes = [...hashedCodes];
            updatedCodes.splice(index, 1);
            return { isValid: true, updatedCodes };
        }

        return { isValid: false, updatedCodes: hashedCodes };
    }
}
