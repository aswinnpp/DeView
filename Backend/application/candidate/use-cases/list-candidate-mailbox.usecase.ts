import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IOfferMailRepository } from '../../job-application/ports/repository/IOfferMailRepository.js';
import type { ICounterLetterRepository } from '../../job-application/ports/repository/ICounterLetterRepository.js';
import type { IRejectionMailRepository } from '../../job-application/ports/repository/IRejectionMailRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';

export interface ICandidateMailboxOfferView {
  id: string | null;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  content: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  /** Candidate response. */
  status: 'pending' | 'accepted' | 'declined' | 'counter';
  counterLetter?: string;
  counterSentAt?: string;
  /** Company response to candidate counter (accepted | rejected). */
  counterResponseStatus?: 'accepted' | 'rejected';
  createdAt: string;
}

export interface ICandidateMailboxRejectionView {
  id: string | null;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

export interface IListCandidateMailboxOutput {
  offers: ICandidateMailboxOfferView[];
  rejections: ICandidateMailboxRejectionView[];
}

@injectable()
export class ListCandidateMailboxUseCase {
  constructor(
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMails: IOfferMailRepository,
    @inject(TYPES.CounterLetterRepositoryPort)
    private readonly _counterLetters: ICounterLetterRepository,
    @inject(TYPES.RejectionMailRepositoryPort)
    private readonly _rejectionMails: IRejectionMailRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobs: IJobRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companies: ICompanyProfileRepository
  ) {}

  async execute(candidateUserId: string): Promise<IListCandidateMailboxOutput> {
    const uid = String(candidateUserId ?? '').trim();
    const [offers, rejections] = await Promise.all([
      this._offerMails.listByCandidateUserId(uid),
      this._rejectionMails.listByCandidateUserId(uid),
    ]);

    const offerIds = offers.map((o) => o.id).filter((id): id is string => Boolean(id));
    const [counterByOfferId, legacyEmbedded] = await Promise.all([
      this._counterLetters.findLatestByOfferMailIds(offerIds),
      this._offerMails.findLegacyEmbeddedCountersByOfferMailIds(offerIds),
    ]);

    const jobIds = new Set<string>();
    const companyIds = new Set<string>();
    for (const o of offers) {
      jobIds.add(o.jobId);
      companyIds.add(o.companyId);
    }
    for (const r of rejections) {
      jobIds.add(r.jobId);
      companyIds.add(r.companyId);
    }

    const jobTitles = new Map<string, string>();
    const companyNames = new Map<string, string>();

    await Promise.all(
      [...jobIds].map(async (jid) => {
        const job = await this._jobs.findById(jid);
        jobTitles.set(jid, job?.title ?? 'Position');
      })
    );

    await Promise.all(
      [...companyIds].map(async (cid) => {
        const c = await this._companies.findById(cid);
        companyNames.set(cid, c?.companyName ?? 'Company');
      })
    );

    const toIso = (d: Date) => (d instanceof Date ? d.toISOString() : String(d));

    return {
      offers: offers.map((o) => {
        const oid = o.id ?? '';
        const fromNew = oid ? counterByOfferId.get(oid) : undefined;
        const fromLegacy = oid && !fromNew ? legacyEmbedded.get(oid) : undefined;
        const counterLetter = fromNew?.content ?? fromLegacy?.content;
        const counterSentAt =
          fromNew?.createdAt != null
            ? toIso(fromNew.createdAt)
            : fromLegacy?.sentAt != null
              ? toIso(fromLegacy.sentAt)
              : undefined;
        const counterResponseStatus =
          fromNew?.responseStatus === 'accepted' || fromNew?.responseStatus === 'rejected'
            ? fromNew.responseStatus
            : undefined;
        return {
          id: o.id,
          applicationId: o.applicationId,
          jobId: o.jobId,
          jobTitle: jobTitles.get(o.jobId) ?? 'Position',
          companyName: companyNames.get(o.companyId) ?? 'Company',
          content: o.content,
          salary: o.salary,
          location: o.location,
          startDate: o.startDate,
          benefits: o.benefits,
          status: o.status,
          ...(counterLetter !== undefined && { counterLetter }),
          ...(counterSentAt !== undefined && { counterSentAt }),
          ...(counterResponseStatus !== undefined && { counterResponseStatus }),
          createdAt: toIso(o.createdAt),
        };
      }),
      rejections: rejections.map((r) => ({
        id: r.id,
        applicationId: r.applicationId,
        jobId: r.jobId,
        jobTitle: jobTitles.get(r.jobId) ?? 'Position',
        companyName: companyNames.get(r.companyId) ?? 'Company',
        content: r.content,
        createdAt: toIso(r.createdAt),
      })),
    };
  }
}
