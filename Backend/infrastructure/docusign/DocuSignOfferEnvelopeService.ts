import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { IEnvConfig } from '../config/env.js';
import { DocuSignJwtAuthService } from './DocuSignJwtAuthService.js';

type UserInfoAccount = { account_id: string; base_uri: string; is_default?: boolean | string };

type CachedContext = {
  token: string;
  accountId: string;
  apiRoot: string;
  exp: number;
};

function pickAccount(accounts: UserInfoAccount[], preferredAccountId?: string): UserInfoAccount {
  const pid = preferredAccountId?.trim();
  if (pid) {
    const m = accounts.find((a) => a.account_id === pid);
    if (m) return m;
  }
  const def = accounts.find((a) => a.is_default === true || a.is_default === 'true');
  return def ?? accounts[0];
}

/** pdf-lib StandardFonts only support WinAnsi; strip/swap chars that would throw at draw time. */
function safePdfText(s: string): string {
  return s.replace(/[^\n\r\t\x20-\x7e]/g, '?');
}

/** Match envelope + recipient view (DocuSign matches email case-insensitively; normalize to avoid UNKNOWN_ENVELOPE_RECIPIENT). */
function normalizeSignerEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeSignerName(name: string): string {
  return name.trim();
}

function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  for (const p of paragraphs) {
    let rest = p.trimEnd();
    if (!rest) {
      lines.push('');
      continue;
    }
    while (rest.length > 0) {
      if (rest.length <= maxChars) {
        lines.push(rest);
        break;
      }
      const slice = rest.slice(0, maxChars);
      const breakAt = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('\t'), 0);
      const take = breakAt > 20 ? breakAt : maxChars;
      lines.push(rest.slice(0, take).trimEnd());
      rest = rest.slice(take).trimStart();
    }
  }
  return lines;
}

async function buildOfferLetterPdfBase64(input: {
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  offerBody: string;
  salary?: string;
  location?: string;
  startDate?: string;
}): Promise<string> {
  const companyName = safePdfText(input.companyName);
  const candidateName = safePdfText(input.candidateName);
  const candidateEmail = safePdfText(input.candidateEmail);
  const offerBody = safePdfText(input.offerBody);
  const salary = input.salary ? safePdfText(input.salary) : '';
  const location = input.location ? safePdfText(input.location) : '';
  const startDate = input.startDate ? safePdfText(input.startDate) : '';

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  const lineHeight = 14;
  let page = pdf.addPage([612, 792]);
  let y = 760;

  const draw = (t: string, opts?: { bold?: boolean; size?: number }) => {
    const size = opts?.size ?? 11;
    const f = opts?.bold ? fontBold : font;
    const wrapped = wrapLines(t, 85);
    for (const line of wrapped) {
      if (y < margin + lineHeight) {
        page = pdf.addPage([612, 792]);
        y = 760;
      }
      page.drawText(line, { x: margin, y, size, font: f });
      y -= lineHeight;
    }
  };

  draw('OFFER LETTER', { bold: true, size: 16 });
  y -= 6;
  draw(`To: ${candidateName} <${candidateEmail}>`, { bold: true });
  draw(`From: ${companyName}`, { bold: true });
  y -= 8;
  if (salary.trim()) draw(`Compensation: ${salary.trim()}`);
  if (location.trim()) draw(`Location: ${location.trim()}`);
  if (startDate.trim()) draw(`Start date: ${startDate.trim()}`);
  y -= 8;
  draw(offerBody.trim() || '(No additional letter body.)');
  y -= 24;
  draw('Please sign below to accept this offer:', { bold: true });
  y -= 4;
  draw('/ds-sign/', { size: 10 });

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString('base64');
}

export class DocuSignOfferEnvelopeService {
  private _cache: CachedContext | null = null;

  constructor(private readonly _env: IEnvConfig) {}

  clearCache(): void {
    this._cache = null;
  }

  private async getContext(): Promise<{ token: string; accountId: string; apiRoot: string }> {
    const now = Date.now();
    if (this._cache && this._cache.exp > now + 60_000) {
      const { token, accountId, apiRoot } = this._cache;
      return { token, accountId, apiRoot };
    }

    const jwtAuth = DocuSignJwtAuthService.fromEnv(this._env);
    if (!jwtAuth) {
      throw new Error('DOCUSIGN_NOT_CONFIGURED');
    }

    const tok = await jwtAuth.requestAccessToken();
    const oauthHost = (this._env.DOCUSIGN_OAUTH_HOST ?? 'account-d.docusign.com').replace(
      /^https?:\/\//,
      ''
    );
    const uiRes = await fetch(`https://${oauthHost}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    if (!uiRes.ok) {
      const t = await uiRes.text();
      throw new Error(`DocuSign userinfo failed: ${uiRes.status} ${t}`);
    }
    const ui = (await uiRes.json()) as { accounts?: UserInfoAccount[] };
    const accounts = ui.accounts ?? [];
    if (accounts.length === 0) {
      throw new Error('DocuSign userinfo returned no accounts');
    }
    const acc = pickAccount(accounts, this._env.DOCUSIGN_ACCOUNT_ID);
    const apiRoot = `${String(acc.base_uri).replace(/\/$/, '')}/restapi/v2.1`;
    const ttlMs = Math.min(tok.expires_in ?? 3600, 3300) * 1000;
    this._cache = {
      token: tok.access_token,
      accountId: acc.account_id,
      apiRoot,
      exp: now + ttlMs,
    };
    return {
      token: this._cache.token,
      accountId: this._cache.accountId,
      apiRoot: this._cache.apiRoot,
    };
  }

  async getCombinedDocumentPdf(envelopeId: string): Promise<Buffer> {
    const ctx = await this.getContext();
    const url = `${ctx.apiRoot}/accounts/${ctx.accountId}/envelopes/${encodeURIComponent(envelopeId)}/documents/combined`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        Accept: 'application/pdf',
      },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`DocuSign combined PDF failed: ${res.status} ${t}`);
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }

  async getEnvelopeStatus(envelopeId: string): Promise<string> {
    const ctx = await this.getContext();
    const res = await fetch(
      `${ctx.apiRoot}/accounts/${ctx.accountId}/envelopes/${encodeURIComponent(envelopeId)}`,
      { headers: { Authorization: `Bearer ${ctx.token}` } }
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`DocuSign get envelope failed: ${res.status} ${t}`);
    }
    const data = (await res.json()) as { status?: string };
    return String(data.status ?? '').toLowerCase();
  }

  async createOfferAcceptanceEnvelope(input: {
    signerEmail: string;
    signerName: string;
    clientUserId: string;
    companyName: string;
    candidateName: string;
    offerBody: string;
    salary?: string;
    location?: string;
    startDate?: string;
  }): Promise<string> {
    const ctx = await this.getContext();
    const signerEmail = normalizeSignerEmail(input.signerEmail);
    const signerName = normalizeSignerName(input.signerName);
    const documentBase64 = await buildOfferLetterPdfBase64({
      companyName: input.companyName,
      candidateName: input.candidateName,
      candidateEmail: signerEmail,
      offerBody: input.offerBody,
      salary: input.salary,
      location: input.location,
      startDate: input.startDate,
    });

    const definition = {
      emailSubject: 'Please sign to accept your offer',
      documents: [
        {
          documentBase64,
          documentId: '1',
          fileExtension: 'pdf',
          name: 'Offer letter',
        },
      ],
      recipients: {
        signers: [
          {
            email: signerEmail,
            name: signerName,
            recipientId: '1',
            routingOrder: '1',
            clientUserId: input.clientUserId,
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  anchorString: '/ds-sign/',
                  anchorUnits: 'pixels',
                  anchorXOffset: '0',
                  anchorYOffset: '0',
                },
              ],
            },
          },
        ],
      },
      status: 'sent',
    };

    const res = await fetch(`${ctx.apiRoot}/accounts/${ctx.accountId}/envelopes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(definition),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`DocuSign create envelope failed: ${res.status} ${t}`);
    }
    const data = (await res.json()) as { envelopeId?: string };
    const id = data.envelopeId?.trim();
    if (!id) {
      throw new Error('DocuSign create envelope: missing envelopeId');
    }
    return id;
  }

  async createEmbeddedSigningUrl(input: {
    envelopeId: string;
    returnUrl: string;
    signerEmail: string;
    signerName: string;
    clientUserId: string;
  }): Promise<string> {
    const ctx = await this.getContext();
    const email = normalizeSignerEmail(input.signerEmail);
    const userName = normalizeSignerName(input.signerName);
    const body = {
      returnUrl: input.returnUrl,
      /** Embedded captive signer — no DocuSign account login (your app authenticated the user). */
      authenticationMethod: 'none',
      email,
      userName,
      clientUserId: input.clientUserId,
      recipientId: '1',
    };
    const res = await fetch(
      `${ctx.apiRoot}/accounts/${ctx.accountId}/envelopes/${encodeURIComponent(input.envelopeId)}/views/recipient`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`DocuSign recipient view failed: ${res.status} ${t}`);
    }
    const data = (await res.json()) as { url?: string };
    const url = data.url?.trim();
    if (!url) {
      throw new Error('DocuSign recipient view: missing url');
    }
    return url;
  }
}
