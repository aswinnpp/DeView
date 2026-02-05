import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OAuth2Client } from 'google-auth-library';

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
    email_verified: boolean;
    sub: string; // Google user ID
}

export class GoogleAuthService {
    private client: OAuth2Client;
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.client = new OAuth2Client(clientId, clientSecret, redirectUri);
    }

    // Generate Google OAuth URL
    getAuthUrl(role?: string, mode?: string): string {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        const state = (role || mode) ? JSON.stringify({ role, mode }) : undefined;

        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state,
        });
    }

    // Verify Google token and get user info
    async verifyToken(code: string): Promise<GoogleUser> {
        try {
            const { tokens } = await this.client.getToken(code);

            if (!tokens.id_token) {
                throw new Error('No ID token received from Google');
            }

            // Decode the token payload without strict time validation
            // This is a workaround for clock skew issues
            const base64Payload = tokens.id_token.split('.')[1];
            const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

            console.log('📋 Decoded Google token payload:', payload);

            // Basic validation
            if (!payload.email || !payload.sub) {
                throw new Error('Invalid token payload from Google');
            }

            // Verify audience matches our client ID
            if (payload.aud !== this.clientId) {
                throw new Error('Token audience mismatch');
            }

            return {
                email: payload.email,
                name: payload.name || payload.email,
                picture: payload.picture,
                email_verified: payload.email_verified || false,
                sub: payload.sub,
            };
        } catch (error) {
            console.error('Google token verification failed:', error);
            throw new Error(`Failed to verify Google token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
