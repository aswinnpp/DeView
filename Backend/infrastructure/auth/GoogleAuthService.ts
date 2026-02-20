import { OAuth2Client } from 'google-auth-library';
import { GoogleAuthPort } from '../../application/auth/ports/GoogleAuthPort.js';
import { GoogleUserDTO } from '../../application/auth/dtos/GoogleUserDTO.js';

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
    email_verified: boolean;
    sub: string;
}

export class GoogleAuthService implements GoogleAuthPort {
    private client: OAuth2Client | null;
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.clientId = clientId || '';
        this.clientSecret = clientSecret || '';
        this.redirectUri = redirectUri || '';
        const hasCredentials = Boolean(this.clientId && this.clientSecret && this.redirectUri);
        this.client = hasCredentials ? new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri) : null;
    }

    private getClient(): OAuth2Client {
        if (!this.client) {
            throw new Error(
                'Google OAuth is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to your .env file.'
            );
        }
        return this.client;
    }

    // Generate Google OAuth URL
    getAuthUrl(role?: string, mode?: string): string {
        const client = this.getClient();
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        const state = (role || mode) ? JSON.stringify({ role, mode }) : undefined;

        return client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state,
        });
    }

    async verifyToken(code: string): Promise<GoogleUserDTO> {
        const client = this.getClient();
        try {
            const { tokens } = await client.getToken(code);

            if (!tokens.id_token) {
                throw new Error('No ID token received from Google');
            }

            
            const base64Payload = tokens.id_token.split('.')[1];
            const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());


            if (!payload.email || !payload.sub) {
                throw new Error('Invalid token payload from Google');
            }

            if (payload.aud !== this.clientId) {
                throw new Error('Token audience mismatch');
            }

            return {
                email: payload.email,
                name: payload.name || payload.email,
            };
        } catch (error) {
            throw new Error(`Failed to verify Google token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
