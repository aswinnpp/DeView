import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const frameMargin = 36;
  const margin = 58;
  const topY = pageHeight - margin;
  const bottomY = margin;

  const lineHeight = 14;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = topY;

  const ensureSpace = (neededLines: number) => {
    if (y < bottomY + neededLines * lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = topY;
    }
  };

  const drawDivider = () => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.35, 0.35, 0.35),
    });
    y -= 12;
  };

  const drawWrapped = (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb>; indent?: number }
  ) => {
    const size = opts?.size ?? 11;
    const f = opts?.bold ? fontBold : font;
    const color = opts?.color ?? rgb(0, 0, 0);
    const indent = opts?.indent ?? 0;
    const maxChars = indent > 0 ? 88 : 95;
    const wrapped = wrapLines(text, maxChars);

    for (const line of wrapped) {
      ensureSpace(1);
      if (line === '') {
        y -= Math.max(6, lineHeight - 4);
        continue;
      }
      page.drawText(line, { x: margin + indent, y, size, font: f, color });
      y -= lineHeight;
    }
  };

  const drawCentered = (text: string, opts?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> }) => {
    const size = opts?.size ?? 12;
    const f = opts?.bold ? fontBold : font;
    const color = opts?.color ?? rgb(0, 0, 0);
    const width = f.widthOfTextAtSize(text, size);
    const x = (pageWidth - width) / 2;
    ensureSpace(1);
    page.drawText(text, { x, y, size, font: f, color });
    y -= lineHeight + 6;
  };

  const drawPageFrame = () => {
    page.drawRectangle({
      x: frameMargin,
      y: frameMargin,
      width: pageWidth - frameMargin * 2,
      height: pageHeight - frameMargin * 2,
      borderColor: rgb(0.12, 0.62, 0.84),
      borderWidth: 1.6,
    });
  };

  drawPageFrame();

  // Header (formal offer-letter style)
  drawCentered('JOB OFFER LETTER', { bold: true, size: 20, color: rgb(0.12, 0.12, 0.12) });
  drawWrapped(companyName, { bold: true, size: 12 });
  drawWrapped(`Date: ${formattedDate}`, { size: 11, color: rgb(0.25, 0.25, 0.25) });
  y -= 2;
  drawDivider();
  drawWrapped(`To: ${candidateName}`, { bold: true, size: 12 });
  drawWrapped(`Email: ${candidateEmail}`, { size: 11 });
  y -= 2;
  drawWrapped('Subject: Job Offer', { bold: true, size: 12 });
  y -= 4;

  const body = offerBody.trim() || '(No additional letter body.)';
  drawWrapped(body, { size: 11 });
  y -= 6;

  drawWrapped('Position Details:', { bold: true, size: 12 });
  if (startDate.trim()) drawWrapped(`- Start Date: ${startDate.trim()}`, { size: 11, indent: 12 });
  if (location.trim()) drawWrapped(`- Work Location: ${location.trim()}`, { size: 11, indent: 12 });
  if (!startDate.trim() && !location.trim()) {
    drawWrapped('- Details will be shared by HR.', { size: 11, indent: 12 });
  }

  y -= 4;
  drawWrapped('Compensation & Benefits:', { bold: true, size: 12 });
  if (salary.trim()) {
    drawWrapped(`- Salary: ${salary.trim()}`, { size: 11, indent: 12 });
  } else {
    drawWrapped('- Salary details will be shared by HR.', { size: 11, indent: 12 });
  }

  y -= 4;
  drawWrapped('Terms & Conditions:', { bold: true, size: 12 });
  drawWrapped('- Employment is subject to company policies.', { size: 11, indent: 12 });
  drawWrapped('- Candidate must complete joining formalities and required documentation.', { size: 11, indent: 12 });
  drawWrapped('- Either party may terminate employment as per policy and applicable law.', { size: 11, indent: 12 });

  y -= 8;
  drawWrapped('Please sign below to confirm acceptance of this offer:', { bold: true, size: 11, color: rgb(0, 0, 0) });
  y -= 6;

  const signatureBoxHeight = 44;
  const signatureBoxY = y - signatureBoxHeight;
  page.drawRectangle({
    x: margin,
    y: signatureBoxY,
    width: pageWidth - margin * 2,
    height: signatureBoxHeight,
    borderColor: rgb(0.3, 0.3, 0.3),
    borderWidth: 1,
  });
  page.drawText('Signature', { x: margin + 12, y: signatureBoxY + 15, size: 10, font });

  // DocuSign anchor text must exist in the PDF. We keep it effectively invisible.
  page.drawText('/ds-sign/', {
    x: margin + 12,
    y: signatureBoxY + 30,
    size: 10,
    font,
    color: rgb(1, 1, 1),
  });

  y = signatureBoxY - 18;

 
  ensureSpace(3);
  drawWrapped('To complete signing, please upload your government ID proof:', {
    bold: true,
    size: 11,
    color: rgb(0, 0, 0),
  });

  const idProofLinkText = 'Upload ID Proof';
  const idProofLinkSize = 11;
  const idProofLinkX = margin + 12;
  const idProofLinkColor = rgb(0.0, 0.35, 0.7);

  ensureSpace(1);
  page.drawText(idProofLinkText, {
    x: idProofLinkX,
    y,
    size: idProofLinkSize,
    font,
    color: idProofLinkColor,
  });
  const linkWidth = font.widthOfTextAtSize(idProofLinkText, idProofLinkSize);
  page.drawLine({
    start: { x: idProofLinkX, y: y - 2 },
    end: { x: idProofLinkX + linkWidth, y: y - 2 },
    thickness: 0.8,
    color: idProofLinkColor,
  });


  y -= lineHeight + 6;

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
              signerAttachmentTabs: [
                {
                  documentId: '1',
                  // Keep in sync with `idProofLinkText` in buildOfferLetterPdfBase64()
                  anchorString: 'Upload ID Proof',
                  anchorUnits: 'pixels',
                  anchorXOffset: '0',
                  anchorYOffset: '0',
                  name: 'Government ID Proof',
                  tabLabel: 'ID_PROOF_ATTACHMENT',
                  optional: 'false',
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
