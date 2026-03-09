import type { InterviewFeedback } from '../../../../domain/interview/entities/InterviewFeedback.js';

export interface IInterviewFeedbackRepository {
  create(feedback: InterviewFeedback): Promise<InterviewFeedback>;
  listByCandidateUserId(candidateUserId: string): Promise<InterviewFeedback[]>;
}

