import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../ports/repository/ICounterLetterRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { CounterLetter } from '../../../domain/entities/CounterLetter.js';

export interface IListOfferMailsInputDTO {
  companyId: string;
}

export interface IListOfferMailsResult {
  data: OfferMail[];
  /** Latest counter letter per offer mail id (from `counterLetters` collection). */
  counterLettersByOfferMailId: Map<string, CounterLetter>;
  /** Legacy embedded counter on `offerMails` documents (deprecated). */
  legacyEmbeddedCounters: Map<string, { content: string; sentAt: Date }>;
}

@injectable()
export class ListOfferMailsUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMailRepository: IOfferMailRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetterRepository: ICounterLetterRepository
  ) {}

  async execute(input: IListOfferMailsInputDTO): Promise<IListOfferMailsResult> {
    const companyId = String(input.companyId ?? '').trim();
    const data = await this._offerMailRepository.listByCompanyId(companyId);
    const ids = data.map((o) => o.id).filter((id): id is string => Boolean(id));
    const [counterLettersByOfferMailId, legacyEmbeddedCounters] = await Promise.all([
      this._counterLetterRepository.findLatestByOfferMailIds(ids),
      this._offerMailRepository.findLegacyEmbeddedCountersByOfferMailIds(ids),
    ]);
    return { data, counterLettersByOfferMailId, legacyEmbeddedCounters };
  }
}
