import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../../job-application/ports/repository/ICounterLetterRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { CounterLetter } from '../../../domain/entities/CounterLetter.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface ISubmitOfferCounterLetterResult {
  offer: OfferMail;
  counter: CounterLetter;
}

@injectable()
export class SubmitOfferCounterLetterUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMails: IOfferMailRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetters: ICounterLetterRepository
  ) {}

  async execute(input: {
    candidateUserId: string;
    offerMailId: string;
    letter: string;
  }): Promise<ISubmitOfferCounterLetterResult> {
    const letter = input.letter?.trim() ?? '';
    if (!letter) {
      throw AppError.badRequest('Counter letter is required');
    }

    const offer = await this._offerMails.findByIdAndCandidateUserId(
      input.offerMailId,
      input.candidateUserId
    );
    if (!offer?.id) {
      throw AppError.notFound('Offer not found or a counter reply is not allowed for this offer');
    }
    if (offer.status === 'accepted' || offer.status === 'declined') {
      throw AppError.notFound('Offer not found or a counter reply is not allowed for this offer');
    }

    const counter = await this._counterLetters.create({
      offerMailId: offer.id,
      applicationId: offer.applicationId,
      jobId: offer.jobId,
      companyId: offer.companyId,
      candidateUserId: offer.candidateUserId,
      content: letter,
    });

    const updated = await this._offerMails.markStatusCounterIfEligible(offer.id, input.candidateUserId);
    if (!updated) {
      throw AppError.notFound('Offer not found or a counter reply is not allowed for this offer');
    }

    return { offer: updated, counter };
  }
}
