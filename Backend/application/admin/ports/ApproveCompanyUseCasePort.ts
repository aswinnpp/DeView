export interface ApproveCompanyUseCasePort {
  execute(approvalId: string): Promise<void>;
}
