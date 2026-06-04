export interface IGetHrProfilePicViewUrlUseCase {
  execute(userId: string): Promise<{ url: string }>;
}
