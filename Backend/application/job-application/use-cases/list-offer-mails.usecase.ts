import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../ports/repository/ICounterLetterRepository.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { CounterLetter } from '../../../domain/entities/CounterLetter.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';

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

@injectable()
export class ListOfferMailsUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMailRepository: IOfferMailRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetterRepository: ICounterLetterRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobRepository: IJobRepository
  ) {}

  async execute(input: IListOfferMailsInputDTO): Promise<IListOfferMailsResult> {
    const companyId = String(input.companyId ?? '').trim();
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 10));

    const allOffers = await this._offerMailRepository.listByCompanyId(companyId);

    let filtered = allOffers;

    if (input.jobId?.trim()) {
      filtered = filtered.filter((o) => o.jobId === input.jobId);
    }

    if (input.status) {
      filtered = filtered.filter((o) => o.status === input.status);
    }

    if (input.search?.trim()) {
      const search = input.search.trim();
      const jobIds = new Set<string>();
      let jobPage = 1;
      const jobLimit = 100; 

      
      while (true) {
        const { data: jobs, total } = await this._jobRepository.listByCompanyIdPaginated(companyId, {
          search,
          page: jobPage,
          limit: jobLimit,
        });
        jobs.forEach((j) => {
          if (j.id) jobIds.add(j.id);
        });

        if (jobPage * jobLimit >= total) break;
        jobPage += 1;
      }

      filtered = filtered.filter((o) => jobIds.has(o.jobId));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const ids = data.map((o) => o.id).filter((id): id is string => Boolean(id));
    const [counterLettersByOfferMailId, legacyEmbeddedCounters] = await Promise.all([
      this._counterLetterRepository.findLatestByOfferMailIds(ids),
      this._offerMailRepository.findLegacyEmbeddedCountersByOfferMailIds(ids),
    ]);

    return { data, total, counterLettersByOfferMailId, legacyEmbeddedCounters };
  }
}
