import type { Interview } from '../../../../domain/interview/entities/Interview.js';

export interface IRequestCandidateRescheduleUseCase {
  execute(input: {
    interviewId: string;
    candidateUserId: string;
    requestedDate: string;
    reason: string;
  }): Promise<{ interview: Interview }>;
}

