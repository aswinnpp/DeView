import { InterviewerProfile } from "../../../../domain/entities/InterviewerProfile";

export interface IInterviewerProfileRepository {
  findByUserId(userId: string): Promise<InterviewerProfile | null>;
  save(profile: InterviewerProfile): Promise<void>;
}
