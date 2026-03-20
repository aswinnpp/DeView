import type { Interview } from '../../../../domain/entities/Interview.js';

export interface IRequestCandidateRescheduleUseCase {
  execute(input: {
    interviewId: string;
    candidateUserId: string;
    requestedDate: string;
    reason: string;
  }): Promise<{ interview: Interview }>;
}

