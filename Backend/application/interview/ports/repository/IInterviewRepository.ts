import type { Interview } from '../../../../domain/interview/entities/Interview.js';

export interface IInterviewRepository {
  create(interview: Interview): Promise<Interview>;
  listByCandidateUserId(candidateUserId: string): Promise<Interview[]>;
  listByCompanyId(companyId: string): Promise<Interview[]>;
}

