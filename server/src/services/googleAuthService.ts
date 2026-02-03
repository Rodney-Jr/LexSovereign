import { OAuth2Client, TokenPayload } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export class GoogleAuthService {
    /**
     * Verifies a Google ID Token and returns the user payload.
     * @param idToken The token received from the frontend.
     */
    public static async verifyToken(idToken: string): Promise<TokenPayload | undefined> {
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: CLIENT_ID,
            });
            return ticket.getPayload();
        } catch (error) {
            console.error('[GoogleAuth] Token verification failed:', error);
            return undefined;
        }
    }
}
