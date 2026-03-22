import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import { AppError } from '../../../shared/errors/AppError.js';

export type OfferResponseAction = 'accept' | 'decline';

@injectable()
export class RespondToOfferLetterUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMails: IOfferMailRepository
  ) {}

  async execute(input: {
    candidateUserId: string;
    offerMailId: string;
    action: OfferResponseAction;
  }): Promise<OfferMail> {
    const action = input.action;
    if (action === 'accept') {
      throw AppError.badRequest(
        'Use the DocuSign signing flow to accept. Open Accept on the offer to sign digitally.'
      );
    }
    if (action !== 'decline') {
      throw AppError.badRequest('action must be decline');
    }

    const offer = await this._offerMails.findByIdAndCandidateUserId(
      input.offerMailId,
      input.candidateUserId
    );
    if (!offer?.id) {
      throw AppError.notFound('Offer not found or you cannot respond to it');
    }
    if (offer.status !== 'pending') {
      throw AppError.badRequest('This offer is no longer awaiting your response');
    }

    const nextStatus = 'declined';
    const updated = await this._offerMails.updateStatusIfCandidatePending(
      offer.id,
      input.candidateUserId,
      nextStatus
    );
    if (!updated) {
      throw AppError.badRequest('This offer is no longer awaiting your response');
    }

    return updated;
  }
}
