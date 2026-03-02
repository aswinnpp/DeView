import type { RejectionMail } from '../../../../domain/application/entities/RejectionMail.js';

export interface IRejectionMailRepository {
  create(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    candidateName: string;
    candidateEmail: string;
    content: string;
  }): Promise<RejectionMail>;
}

