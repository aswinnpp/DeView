import type { Interview } from '../../../../domain/entities/Interview.js';

export interface IRejectInterviewAssignmentUseCase {
  execute(input: { interviewId: string; interviewerUserId: string; reason: string }): Promise<{ data: Interview | null }>;
}

