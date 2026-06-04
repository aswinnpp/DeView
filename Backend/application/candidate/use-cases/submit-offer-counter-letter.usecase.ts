import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../../job-application/ports/repository/ICounterLetterRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { CounterLetter } from '../../../domain/entities/CounterLetter.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ApplicationMapper } from '../../job-application/mappers/ApplicationMapper.js';

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
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
    positionTitle?: string;
  }): Promise<ReturnType<(typeof ApplicationMapper)['toSubmitOfferCounterView']>> {
    const letter = input.letter?.trim() ?? '';
    if (!letter) {
      throw AppError.badRequest('Counter letter is required');
    }

    const normalizeOptionalText = (v: string | undefined): string | undefined => {
      const t = (v ?? '').trim();
      return t.length > 0 ? t : undefined;
    };

    const salary = normalizeOptionalText(input.salary);
    if (salary && !/\d/.test(salary)) {
      throw AppError.badRequest('Salary must contain at least one digit');
    }

    const location = normalizeOptionalText(input.location);
    if (location && location.length < 2) {
      throw AppError.badRequest('Location must be at least 2 characters');
    }

    const startDate = normalizeOptionalText(input.startDate);
    if (startDate) {
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;
      const parsed = new Date(startDate);
      if (!isoDate.test(startDate) && Number.isNaN(parsed.getTime())) {
        throw AppError.badRequest('Start date must be a valid date (YYYY-MM-DD) or ISO date string');
      }
    }

    const benefits = normalizeOptionalText(input.benefits);
    if (benefits && benefits.length < 3) {
      throw AppError.badRequest('Benefits must be at least 3 characters');
    }

    const positionTitle = normalizeOptionalText(input.positionTitle);
    if (positionTitle && positionTitle.length < 2) {
      throw AppError.badRequest('Position title must be at least 2 characters');
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
      salary,
      location,
      startDate,
      benefits,
      positionTitle,
    });

    const updated = await this._offerMails.markStatusCounterIfEligible(offer.id, input.candidateUserId);
    if (!updated) {
      throw AppError.notFound('Offer not found or a counter reply is not allowed for this offer');
    }

    return ApplicationMapper.toSubmitOfferCounterView({ offer: updated, counter });
  }
}
