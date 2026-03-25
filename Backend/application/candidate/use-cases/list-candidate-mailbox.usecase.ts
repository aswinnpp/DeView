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
  candidateName: string;
  candidateEmail: string;
  content: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  status: 'pending' | 'accepted' | 'declined' | 'counter';
  counterLetter?: string;
  counterSentAt?: string;
  counterResponseStatus?: 'accepted' | 'rejected';
  signedOfferAvailable?: boolean;
  companyAddress: string;
  companyContactPerson: string;
  companyContactEmail: string;
  companyWebsite?: string;
  createdAt: string;
}

export interface ICandidateMailboxRejectionView {
  id: string | null;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  content: string;
  companyAddress: string;
  companyContactPerson: string;
  companyContactEmail: string;
  companyWebsite?: string;
  createdAt: string;
}

export type CandidateMailboxKind = 'all' | 'offer' | 'rejection';

export interface IListCandidateMailboxOutput {
  offers: ICandidateMailboxOfferView[];
  rejections: ICandidateMailboxRejectionView[];
  total: number;
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

  async execute(input: {
    candidateUserId: string;
    kind?: CandidateMailboxKind;
    jobId?: string;
    offerStatus?: 'pending' | 'accepted' | 'declined' | 'counter';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<IListCandidateMailboxOutput> {
    const uid = String(input.candidateUserId ?? '').trim();
    const kind: CandidateMailboxKind = input.kind ?? 'all';
    const jobId = input.jobId?.trim();
    const offerStatus = input.offerStatus;
    const search = input.search?.trim()?.toLowerCase();
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 10));

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
    const companyContactPersons = new Map<string, string>();
    const companyAddresses = new Map<string, string>();
    const companyContactEmails = new Map<string, string>();
    const companyWebsites = new Map<string, string | undefined>();

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
        companyContactPersons.set(cid, c?.contactPerson ?? 'HR Team');
        companyAddresses.set(cid, c?.address ?? '');
        companyContactEmails.set(cid, c?.contactEmail ?? '');
        companyWebsites.set(cid, c?.website);
      })
    );

    const toIso = (d: Date) => (d instanceof Date ? d.toISOString() : String(d));

    const offersMapped: ICandidateMailboxOfferView[] = offers.map((o) => {
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
        const signedOfferAvailable =
          o.status === 'accepted' && Boolean(o.docusignAcceptanceEnvelopeId?.trim());
        return {
          id: o.id,
          applicationId: o.applicationId,
          jobId: o.jobId,
          jobTitle: jobTitles.get(o.jobId) ?? 'Position',
          companyName: companyNames.get(o.companyId) ?? 'Company',
          candidateName: o.candidateName,
          candidateEmail: o.candidateEmail,
          content: o.content,
          salary: o.salary,
          location: o.location,
          startDate: o.startDate,
          benefits: o.benefits,
          status: o.status,
          ...(counterLetter !== undefined && { counterLetter }),
          ...(counterSentAt !== undefined && { counterSentAt }),
          ...(counterResponseStatus !== undefined && { counterResponseStatus }),
          ...(signedOfferAvailable && { signedOfferAvailable: true }),
          companyAddress: companyAddresses.get(o.companyId) ?? '',
          companyContactPerson: companyContactPersons.get(o.companyId) ?? 'HR Team',
          companyContactEmail: companyContactEmails.get(o.companyId) ?? '',
          companyWebsite: companyWebsites.get(o.companyId),
          createdAt: toIso(o.createdAt),
        };
      });

    const rejectionsMapped: ICandidateMailboxRejectionView[] = rejections.map((r) => ({
        id: r.id,
        applicationId: r.applicationId,
        jobId: r.jobId,
        jobTitle: jobTitles.get(r.jobId) ?? 'Position',
        companyName: companyNames.get(r.companyId) ?? 'Company',
        candidateName: r.candidateName,
        candidateEmail: r.candidateEmail,
        content: r.content,
        companyAddress: companyAddresses.get(r.companyId) ?? '',
        companyContactPerson: companyContactPersons.get(r.companyId) ?? 'HR Team',
        companyContactEmail: companyContactEmails.get(r.companyId) ?? '',
        companyWebsite: companyWebsites.get(r.companyId),
        createdAt: toIso(r.createdAt),
    }));

    // Build combined list so we can apply a single sort + pagination.
    const items: Array<
      | ({ kind: 'offer' } & ICandidateMailboxOfferView)
      | ({ kind: 'rejection' } & ICandidateMailboxRejectionView)
    > = [
      ...offersMapped.map((o) => ({ kind: 'offer' as const, ...o })),
      ...rejectionsMapped.map((r) => ({ kind: 'rejection' as const, ...r })),
    ];

    const filtered = items.filter((m) => {
      if (jobId && m.jobId !== jobId) return false;

      if (search) {
        const title = m.jobTitle?.toLowerCase?.() ?? '';
        if (!title.includes(search)) return false;
      }

      if (kind !== 'all' && m.kind !== kind) return false;

      if (offerStatus && m.kind === 'offer' && m.status !== offerStatus) return false;
      // If it's a rejection, ignore `offerStatus`.
      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      offers: paged.filter((m) => m.kind === 'offer').map((m) => {
        const { kind: _kind, ...rest } = m;
        return rest as ICandidateMailboxOfferView;
      }),
      rejections: paged.filter((m) => m.kind === 'rejection').map((m) => {
        const { kind: _kind, ...rest } = m;
        return rest as ICandidateMailboxRejectionView;
      }),
      total,
    };
  }
}
