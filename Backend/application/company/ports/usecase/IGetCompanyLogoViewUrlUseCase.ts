export interface IGetCompanyLogoViewUrlUseCase {
  execute(userId: string): Promise<{ url: string }>;
}
