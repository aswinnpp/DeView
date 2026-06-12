import jwt from 'jsonwebtoken';
import type { IEnvConfig } from '../config/env.js';

export const DOCUSIGN_DEMO_OAUTH_HOST = 'account-d.docusign.com';

export const DOCUSIGN_DEMO_REST_API_BASE = 'https://demo.docusign.net/restapi';

export function getDocuSignRestBaseUrl(e: IEnvConfig): string {
  return e.DOCUSIGN_REST_BASE_URL?.trim() || DOCUSIGN_DEMO_REST_API_BASE;
}

const JWT_BEARER_GRANT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

const DEFAULT_SCOPES = ['signature', 'impersonation'];

export class DocuSignConsentRequiredError extends Error {
  constructor(public readonly consentUrl: string) {
    super('DocuSign consent required');
    this.name = 'DocuSignConsentRequiredError';
  }
}

export interface DocuSignAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface DocuSignJwtAuthConfig {
  integrationKey: string;
  userId: string;
  privateKeyPem: string;
  oauthHost: string;
  /** Must match an authorized redirect URI in the DocuSign app (used for consent only). */
  redirectUri: string;
  /** Seconds until JWT expiry (DocuSign allows up to 3600). */
  jwtLifetimeSeconds?: number;
}

function normalizePemFromEnv(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('BEGIN')) {
    const withNewlines = trimmed.replace(/\\n/g, '\n');
    // Multiline .env values often indent continuation lines; trim each PEM line.
    return withNewlines
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
  }
  try {
    return Buffer.from(trimmed, 'base64').toString('utf8');
  } catch {
    return trimmed.replace(/\\n/g, '\n');
  }
}


export class DocuSignJwtAuthService {
  constructor(private readonly config: DocuSignJwtAuthConfig) { }

  static fromEnv(e: IEnvConfig): DocuSignJwtAuthService | null {
    const integrationKey = e.DOCUSIGN_INTEGRATION_KEY?.trim();
    const userId = e.DOCUSIGN_USER_ID?.trim();
    const rawKey = e.DOCUSIGN_PRIVATE_KEY?.trim();
    if (!integrationKey || !userId || !rawKey) {
      return null;
    }

    
    return new DocuSignJwtAuthService({
      integrationKey,
      userId,
      privateKeyPem: normalizePemFromEnv(rawKey),
      oauthHost: (e.DOCUSIGN_OAUTH_HOST ?? DOCUSIGN_DEMO_OAUTH_HOST).replace(/^https?:\/\//, ''),
      redirectUri: (e.DOCUSIGN_REDIRECT_URI ?? '').trim(),
      jwtLifetimeSeconds: e.DOCUSIGN_JWT_LIFETIME_SECONDS
        ? parseInt(e.DOCUSIGN_JWT_LIFETIME_SECONDS, 10)
        : 600,
    });
  }
   
  /** OAuth consent URL — open in a browser while logged in as the impersonated DocuSign user. */
  getConsentUrl(): string {
    const { integrationKey, redirectUri } = this.config;
    const scope = encodeURIComponent(DEFAULT_SCOPES.join(' '));
    const clientId = encodeURIComponent(integrationKey);
    const uri = encodeURIComponent(redirectUri);
    const host = this.config.oauthHost;
    return `https://${host}/oauth/auth?response_type=code&scope=${scope}&client_id=${clientId}&redirect_uri=${uri}`;
  }

  private createSignedJwt(): string {
    const { integrationKey, userId, privateKeyPem, oauthHost } = this.config;
    const lifetime = Math.min(
      Math.max(this.config.jwtLifetimeSeconds ?? 600, 60),
      3600
    );
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: integrationKey,
      aud: oauthHost,
      iat: now,
      exp: now + lifetime,
      scope: DEFAULT_SCOPES.join(' '),
      sub: userId,
    };

    console.log("KEY START:");
console.log(privateKeyPem.substring(0, 100));

console.log("KEY END:");
console.log(privateKeyPem.slice(-100));

console.log("HAS BEGIN:", privateKeyPem.includes("BEGIN RSA PRIVATE KEY"));
console.log("HAS END:", privateKeyPem.includes("END RSA PRIVATE KEY"));

    return jwt.sign(payload, privateKeyPem, { algorithm: 'RS256' });
  }

  /**
   * Exchanges a signed JWT for an access token.
   * If consent was not granted, DocuSign returns `consent_required` — use `getConsentUrl()` first.
   */
  async requestAccessToken(): Promise<DocuSignAccessToken> {
    const assertion = this.createSignedJwt();
    const host = this.config.oauthHost;
    const body = new URLSearchParams({
      grant_type: JWT_BEARER_GRANT,
      assertion,
    });
    const res = await fetch(`https://${host}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const err = typeof data.error === 'string' ? data.error : 'token_request_failed';
      const desc = typeof data.error_description === 'string' ? data.error_description : '';
      if (err === 'consent_required') {
        throw new DocuSignConsentRequiredError(this.getConsentUrl());
      }
      throw new Error(`DocuSign OAuth error: ${err}${desc ? ` — ${desc}` : ''}`);
    }
    const access_token = data.access_token;
    const token_type = data.token_type;
    const expires_in = data.expires_in;
    if (typeof access_token !== 'string' || typeof token_type !== 'string' || typeof expires_in !== 'number') {
      throw new Error('DocuSign token response missing access_token, token_type, or expires_in');
    }
    return {
      access_token,
      token_type,
      expires_in,
      scope: typeof data.scope === 'string' ? data.scope : undefined,
    };
  }
}
