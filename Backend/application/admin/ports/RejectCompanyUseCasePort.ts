export interface RejectCompanyUseCasePort {
  execute(approvalId: string, reason: string): Promise<void>;
}
