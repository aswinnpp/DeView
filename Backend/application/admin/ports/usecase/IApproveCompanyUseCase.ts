export interface IApproveCompanyUseCase {
  execute(approvalId: string): Promise<void>;
}
