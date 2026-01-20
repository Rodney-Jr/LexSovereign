export interface UserClaims {
    sub: string;       // Subject (User ID)
    email: string;
    roles: string[];
    tenantId?: string;
    iss: string;       // Issuer
}

export interface SovereignUser {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    mfaEnabled: boolean;
    lastSync: Date;
}

export interface IIdentityPort {
    /**
     * Validate an incoming identity token (e.g., JWT).
     * @param token The bearer token string.
     * @returns Parsed user claims if valid.
     * @throws Error if token is invalid or expired.
     */
    validateToken(token: string): Promise<UserClaims>;

    /**
     * Synchronize a user's profile from the external identity provider.
     * (SCIM 2.0 compliant behavior)
     * @param externalUserId The user's ID in the external system (e.g., Azure AD Object ID).
     */
    syncUser(externalUserId: string): Promise<SovereignUser>;

    /**
     * Get the list of groups/roles assigned to the user in the external provider.
     * @param externalUserId The user's external ID.
     */
    syncGroups(externalUserId: string): Promise<string[]>;

    /**
     * Trigger an MFA challenge for the user via the provider's mechanism.
     * @param userId The internal user ID.
     * @returns True if the challenge was successfully initiated.
     */
    challengeMFA(userId: string): Promise<boolean>;
}
