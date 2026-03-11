import type { Interview } from '../../../../domain/interview/entities/Interview.js';

export interface IRejectInterviewAssignmentUseCase {
  execute(input: { interviewId: string; interviewerUserId: string; reason: string }): Promise<{ data: Interview | null }>;
}

