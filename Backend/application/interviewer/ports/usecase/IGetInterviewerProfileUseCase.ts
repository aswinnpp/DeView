import type { InterviewerProfile } from "../../../../domain/interviewer/entities/InterviewerProfile";

export interface IGetInterviewerProfileUseCase {
  execute(userId: string): Promise<InterviewerProfile | null>;
}
