import type { InterviewerProfileStateResponse } from "../../mappers/InterviewerProfileMapper";

export interface IGetInterviewerProfileUseCase {
  execute(userId: string): Promise<InterviewerProfileStateResponse>;
}
