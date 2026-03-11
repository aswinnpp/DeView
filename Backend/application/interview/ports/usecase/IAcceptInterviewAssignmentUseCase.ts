import type { Interview } from '../../../../domain/interview/entities/Interview.js';

export interface IAcceptInterviewAssignmentUseCase {
  execute(input: { interviewId: string; interviewerUserId: string }): Promise<{ data: Interview | null }>;
}

