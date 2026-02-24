export interface IGetApprovedCompaniesUseCase {
  execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string): Promise<{ approvals: unknown[]; total: number }>;
}
