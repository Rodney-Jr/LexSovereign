import { Request, Response, NextFunction } from 'express';

/**
 * Sovereign Guard Middleware
 * Enforces the "Enclave Protocol" by verifying the Sovereign Pin and 
 * ensuring requests originate from a verified sovereign environment.
 */
export const sovereignGuard = (req: Request, res: Response, next: NextFunction) => {
    const sovPin = req.headers['x-sov-pin'];

    // In production, this would be validated against a Secure Enclave / HSM
    // For this deployment, we use the environment-configured pin.
    const EXPECTED_PIN = process.env.SOVEREIGN_PIN;

    console.log(`[SovereignGuard] Inspecting request: ${req.path}`);

    if (!EXPECTED_PIN) {
        console.warn('[SovereignGuard] WARNING: SOVEREIGN_PIN not configured. Pass-through mode active for development.');
        return next();
    }

    if (sovPin !== EXPECTED_PIN) {
        console.error(`[SovereignGuard] ACCESS DENIED: Invalid or missing x-sov-pin for ${req.path}`);
        return res.status(403).json({
            error: 'Sovereign Enclave Access Denied',
            code: 'INVALID_SOVEREIGN_PIN',
            message: 'A valid Sovereign Pin is required to access the enclave layer.'
        });
    }

    console.log('[SovereignGuard] request verification successful.');
    next();
};
