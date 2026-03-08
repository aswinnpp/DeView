import type { Interview, InterviewStatus } from '../../../../domain/interview/entities/Interview.js';

export interface IInterviewRepository {
  create(interview: Interview): Promise<Interview>;
  listByCandidateUserId(candidateUserId: string): Promise<Interview[]>;
  listByInterviewerUserId(interviewerUserId: string): Promise<Interview[]>;
  listByCompanyId(companyId: string): Promise<Interview[]>;
  findById(id: string): Promise<Interview | null>;
  setInterviewerAccepted(id: string, accepted: boolean, rejectReason?: string): Promise<Interview | null>;
  updateStatus(id: string, status: InterviewStatus): Promise<Interview | null>;
}

