import { OAuth2Client } from 'google-auth-library';
import { IGoogleAuth } from '../../application/auth/ports/services/IGoogleAuth.js';
import { IGoogleUserDTO } from '../../application/auth/dtos/GoogleUserDTO.js';

export class GoogleAuthService implements IGoogleAuth {
    private _client: OAuth2Client | null;
    private _clientId: string;
    private _clientSecret: string;
    private _redirectUri: string;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this._clientId = clientId || '';
        this._clientSecret = clientSecret || '';
        this._redirectUri = redirectUri || '';
        const hasCredentials = Boolean(this._clientId && this._clientSecret && this._redirectUri);
        this._client = hasCredentials ? new OAuth2Client(this._clientId, this._clientSecret, this._redirectUri) : null;
    }

    private getClient(): OAuth2Client {
        if (!this._client) {
            throw new Error(
                'Google OAuth is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to your .env file.'
            );
        }
        return this._client;
    }


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

    async verifyToken(code: string): Promise<IGoogleUserDTO> {
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

            if (payload.aud !== this._clientId) {
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
