import type { CounterLetter } from '../../../../domain/entities/CounterLetter.js';

export interface ICounterLetterRepository {
  create(input: {
    offerMailId: string;
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    content: string;
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
    positionTitle?: string;
  }): Promise<CounterLetter>;

  /** Latest counter per offer mail id (by `createdAt`). */
  findLatestByOfferMailIds(offerMailIds: string[]): Promise<Map<string, CounterLetter>>;

  /** Update response status of latest counter for offer mail. Returns updated counter or null. */
  updateResponseStatusByOfferMailId(
    offerMailId: string,
    responseStatus: 'accepted' | 'rejected'
  ): Promise<CounterLetter | null>;
}
