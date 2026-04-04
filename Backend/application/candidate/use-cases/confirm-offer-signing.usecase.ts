import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../infrastructure/config/env.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import { ApplicationMapper } from '../../job-application/mappers/ApplicationMapper.js';
import { DocuSignJwtAuthService } from '../../../infrastructure/docusign/DocuSignJwtAuthService.js';
import { DocuSignOfferEnvelopeService } from '../../../infrastructure/docusign/DocuSignOfferEnvelopeService.js';

@injectable()
export class ConfirmOfferSigningUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offers: IOfferMailRepository,
    @inject(DocuSignOfferEnvelopeService)
    private readonly _docusign: DocuSignOfferEnvelopeService
  ) {}

  async execute(
    input: { candidateUserId: string; offerMailId: string },
  ): Promise<ReturnType<(typeof ApplicationMapper)['toOfferSummaryView']>> {
    if (!DocuSignJwtAuthService.fromEnv(env)) {
      throw AppError.serviceUnavailable('DocuSign is not configured on the server');
    }

    const offer = await this._offers.findByIdAndCandidateUserId(
      input.offerMailId,
      input.candidateUserId
    );
    if (!offer?.id) {
      throw AppError.notFound('Offer not found');
    }

    if (offer.status === 'accepted') {
      return ApplicationMapper.toOfferSummaryView(offer);
    }

    if (!offer.docusignAcceptanceEnvelopeId) {
      throw AppError.badRequest('No DocuSign session exists for this offer');
    }

    if (offer.status !== 'pending') {
      throw AppError.badRequest('This offer is not waiting for a signature');
    }

    const st = await this._docusign.getEnvelopeStatus(offer.docusignAcceptanceEnvelopeId);
    if (st !== 'completed') {
      throw AppError.badRequest(
        'Signing is not complete yet. Finish signing in DocuSign, then try again.'
      );
    }

    const updated = await this._offers.markAcceptedAfterSigning(
      offer.id,
      input.candidateUserId,
      offer.docusignAcceptanceEnvelopeId
    );
    if (!updated) {
      throw AppError.conflict('Could not finalize acceptance. Refresh and try again.');
    }

    return ApplicationMapper.toOfferSummaryView(updated);
  }
}
