export interface IGetInterviewerProfilePicViewUrlUseCase {
  execute(userId: string): Promise<{ url: string }>;
}
