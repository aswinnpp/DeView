import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../infrastructure/config/env.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { ICounterLetterRepository } from '../../job-application/ports/repository/ICounterLetterRepository.js';
import {
  DocuSignConsentRequiredError,
  DocuSignJwtAuthService,
} from '../../../infrastructure/docusign/DocuSignJwtAuthService.js';
import { DocuSignOfferEnvelopeService } from '../../../infrastructure/docusign/DocuSignOfferEnvelopeService.js';

export type BeginOfferSigningResult =
  | { outcome: 'sign'; signingUrl: string }
  | { outcome: 'accepted' }
  | { outcome: 'consent_required' };

function toDocuSignAppError(e: unknown): AppError {
  const raw = e instanceof Error ? e.message : String(e);
  const msg = raw.length > 800 ? `${raw.slice(0, 800)}…` : raw;
  return AppError.serviceUnavailable(
    `DocuSign step failed. Check JWT consent, account, and integration settings. Detail: ${msg}`
  );
}

@injectable()
export class BeginOfferSigningUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offers: IOfferMailRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companies: ICompanyProfileRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetters: ICounterLetterRepository,
    @inject(DocuSignOfferEnvelopeService)
    private readonly _docusign: DocuSignOfferEnvelopeService
  ) {}

  async execute(input: {
    candidateUserId: string;
    offerMailId: string;
  }): Promise<BeginOfferSigningResult> {
    if (!DocuSignJwtAuthService.fromEnv(env)) {
      throw AppError.serviceUnavailable(
        'DocuSign is not configured. Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, and DOCUSIGN_PRIVATE_KEY.'
      );
    }

    const offer = await this._offers.findByIdAndCandidateUserId(
      input.offerMailId,
      input.candidateUserId
    );
    if (!offer?.id) {
      throw AppError.notFound('Offer not found');
    }
    if (offer.status !== 'pending') {
      throw AppError.badRequest('Only a pending offer can be accepted');
    }

    
    let offerBody = offer.content;
    try {
      const counterByOffer = await this._counterLetters.findLatestByOfferMailIds([offer.id]);
      const acceptedCounter = counterByOffer.get(offer.id);
      if (acceptedCounter?.responseStatus === 'accepted') {
        offerBody = acceptedCounter.content;
      }
    } catch {
      // If counter lookup fails, fall back to the original offer content.
    }

    const company = await this._companies.findById(offer.companyId);
    const companyName = company?.companyName?.trim() || 'Employer';
    const companyAddress = company?.address?.trim();
    const companyContactPerson = company?.contactPerson?.trim();
    const companyContactEmail = company?.contactEmail?.trim();
    const companyWebsite = company?.website?.trim();

    const returnUrlBase = env.FRONTEND_URL.replace(/\/$/, '');
    const returnUrl = `${returnUrlBase}/candidate/mails/signing-complete?offerMailId=${encodeURIComponent(offer.id)}`;

    const clientUserId = `offer-${offer.id}`.slice(0, 100);

    if (offer.docusignAcceptanceEnvelopeId) {
      let st = '';
      try {
        st = await this._docusign.getEnvelopeStatus(offer.docusignAcceptanceEnvelopeId);
      } catch {
        st = '';
      }

      if (st === 'completed') {
        const done = await this._offers.markAcceptedAfterSigning(
          offer.id,
          input.candidateUserId,
          offer.docusignAcceptanceEnvelopeId
        );
        if (done) {
          return { outcome: 'accepted' };
        }
      }

      const canResume = st === 'sent' || st === 'delivered' || st === 'created';

      if (canResume) {
        try {
          const signingUrl = await this._docusign.createEmbeddedSigningUrl({
            envelopeId: offer.docusignAcceptanceEnvelopeId,
            returnUrl,
            signerEmail: offer.candidateEmail,
            signerName: offer.candidateName,
            clientUserId,
          });
          return { outcome: 'sign', signingUrl };
        } catch (e) {
          if (e instanceof DocuSignConsentRequiredError) {
            return { outcome: 'consent_required' };
          }
          await this._offers.clearAcceptanceEnvelopeId(offer.id, input.candidateUserId);
        }
      } else if (st) {
        await this._offers.clearAcceptanceEnvelopeId(offer.id, input.candidateUserId);
      } else {
        await this._offers.clearAcceptanceEnvelopeId(offer.id, input.candidateUserId);
      }
    }

    let envelopeId: string;
    try {
      envelopeId = await this._docusign.createOfferAcceptanceEnvelope({
        signerEmail: offer.candidateEmail,
        signerName: offer.candidateName,
        clientUserId,
        companyName,
        companyAddress,
        companyContactPerson,
        companyContactEmail,
        companyWebsite,
        candidateName: offer.candidateName,
        offerBody,
        salary: offer.salary,
        benefits: offer.benefits,
        location: offer.location,
        startDate: offer.startDate,
        positionTitle: offer.positionTitle,
      });
    } catch (e) {
      if (e instanceof DocuSignConsentRequiredError) {
        return { outcome: 'consent_required' };
      }
      throw toDocuSignAppError(e);
    }

    const updated = await this._offers.setAcceptanceEnvelopeId(
      offer.id,
      input.candidateUserId,
      envelopeId
    );
    if (!updated) {
      throw AppError.badRequest('Could not start signing for this offer');
    }

    try {
      const signingUrl = await this._docusign.createEmbeddedSigningUrl({
        envelopeId,
        returnUrl,
        signerEmail: offer.candidateEmail,
        signerName: offer.candidateName,
        clientUserId,
      });
      return { outcome: 'sign', signingUrl };
    } catch (e) {
      if (e instanceof DocuSignConsentRequiredError) {
        return { outcome: 'consent_required' };
      }
      throw toDocuSignAppError(e);
    }
  }
}
