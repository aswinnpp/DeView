import type { InterviewerProfile } from "../../../../domain/entities/InterviewerProfile";

export interface IGetInterviewerProfileUseCase {
  execute(userId: string): Promise<InterviewerProfile | null>;
}
