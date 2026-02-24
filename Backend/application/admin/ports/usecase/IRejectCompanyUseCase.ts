export interface IRejectCompanyUseCase {
  execute(approvalId: string, reason: string): Promise<void>;
}
