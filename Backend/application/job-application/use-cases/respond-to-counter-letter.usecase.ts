import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../ports/repository/ICounterLetterRepository.js';

export interface IRespondToCounterLetterInput {
  offerMailId: string;
  companyId: string;
  action: 'accept' | 'reject';
}

export interface IRespondToCounterLetterResult {
  ok: boolean;
  offerStatus: 'pending' | 'accepted' | 'declined';
  counterResponseStatus: 'accepted' | 'rejected';
}

@injectable()
export class RespondToCounterLetterUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMails: IOfferMailRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetters: ICounterLetterRepository
  ) {}

  async execute(input: IRespondToCounterLetterInput): Promise<IRespondToCounterLetterResult> {
    const { offerMailId, companyId, action } = input;
    const oid = String(offerMailId ?? '').trim();
    const cid = String(companyId ?? '').trim();
    if (!oid || !cid) {
      throw new Error('offerMailId and companyId are required');
    }

    const offers = await this._offerMails.listByCompanyId(cid);
    const offer = offers.find((o) => (o.id ?? '') === oid);
    if (!offer || offer.status !== 'counter') {
      throw new Error('Offer not found or not awaiting counter response');
    }

    const responseStatus = action === 'accept' ? 'accepted' : 'rejected';

    const [counter, updatedOffer] = await Promise.all([
      this._counterLetters.updateResponseStatusByOfferMailId(oid, responseStatus),
      action === 'accept'
        ? this._offerMails.setStatusPending(oid)
        : this._offerMails.updateStatus(oid, 'declined'),
    ]);

    if (!counter || !updatedOffer) {
      throw new Error('Failed to update counter response');
    }

    return {
      ok: true,
      offerStatus: action === 'accept' ? 'pending' : 'declined',
      counterResponseStatus: responseStatus,
    };
  }
}
