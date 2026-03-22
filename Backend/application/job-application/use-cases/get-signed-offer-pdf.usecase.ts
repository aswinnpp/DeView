import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../infrastructure/config/env.js';
import type { IOfferMailRepository } from '../ports/repository/IOfferMailRepository.js';
import { DocuSignJwtAuthService } from '../../../infrastructure/docusign/DocuSignJwtAuthService.js';
import { DocuSignOfferEnvelopeService } from '../../../infrastructure/docusign/DocuSignOfferEnvelopeService.js';

export type GetSignedOfferPdfRequest =
  | { offerMailId: string; candidateUserId: string }
  | { offerMailId: string; companyId: string };

@injectable()
export class GetSignedOfferPdfUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offers: IOfferMailRepository,
    @inject(DocuSignOfferEnvelopeService)
    private readonly _docusign: DocuSignOfferEnvelopeService
  ) {}

  async execute(input: GetSignedOfferPdfRequest): Promise<Buffer> {
    if (!DocuSignJwtAuthService.fromEnv(env)) {
      throw AppError.serviceUnavailable('DocuSign is not configured on the server');
    }

    let offer = null;
    if ('candidateUserId' in input) {
      offer = await this._offers.findByIdAndCandidateUserId(input.offerMailId, input.candidateUserId);
    } else {
      const cid = String(input.companyId ?? '').trim();
      if (!cid) {
        throw AppError.forbidden('Company context required');
      }
      offer = await this._offers.findByIdAndCompanyId(input.offerMailId, cid);
    }

    if (!offer?.id) {
      throw AppError.notFound('Offer not found');
    }
    if (offer.status !== 'accepted') {
      throw AppError.badRequest('Signed PDF is only available for accepted offers');
    }

    const envelopeId = offer.docusignAcceptanceEnvelopeId?.trim();
    if (!envelopeId) {
      throw AppError.notFound('No digitally signed document is stored for this offer');
    }

    try {
      return await this._docusign.getCombinedDocumentPdf(envelopeId);
    } catch {
      throw AppError.serviceUnavailable(
        'Could not retrieve the signed PDF from DocuSign. Try again later.'
      );
    }
  }
}
