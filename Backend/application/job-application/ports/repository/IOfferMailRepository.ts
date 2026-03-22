import type { OfferMail } from '../../../../domain/entities/OfferMail.js';

export interface IOfferMailRepository {
  create(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    candidateName: string;
    candidateEmail: string;
    content: string;
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
  }): Promise<OfferMail>;

  listByCompanyId(companyId: string): Promise<OfferMail[]>;

  listByCandidateUserId(candidateUserId: string): Promise<OfferMail[]>;

  findByIdAndCandidateUserId(offerMailId: string, candidateUserId: string): Promise<OfferMail | null>;

  /**
   * Sets `status` to `counter` when the offer is open for counter (pending, counter, or legacy no status).
   */
  markStatusCounterIfEligible(offerMailId: string, candidateUserId: string): Promise<OfferMail | null>;

  /**
   * Reads embedded counter fields from legacy `offerMails` documents (before migration to `counterLetters`).
   */
  findLegacyEmbeddedCountersByOfferMailIds(offerMailIds: string[]): Promise<
    Map<string, { content: string; sentAt: Date }>
  >;

  /** Update offer mail status (e.g. when company accepts/rejects counter). */
  updateStatus(offerMailId: string, status: 'accepted' | 'declined'): Promise<OfferMail | null>;
}
