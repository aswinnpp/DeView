import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { CounterLetter } from '../../../domain/entities/CounterLetter.js';

export interface IListOfferMailsInputDTO {
  companyId: string;
  jobId?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'counter';
  search?: string;
  page?: number;
  limit?: number;
}

export interface IListOfferMailsResult {
  data: OfferMail[];
  total: number;
  counterLettersByOfferMailId: Map<string, CounterLetter>;
  legacyEmbeddedCounters: Map<string, { content: string; sentAt: Date }>;
}
