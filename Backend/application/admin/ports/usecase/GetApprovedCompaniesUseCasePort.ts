export interface GetApprovedCompaniesUseCasePort {
  execute(search?: string): Promise<{ approvals: unknown[] }>;
}
