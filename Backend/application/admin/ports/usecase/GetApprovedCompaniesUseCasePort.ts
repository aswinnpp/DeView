export interface GetApprovedCompaniesUseCasePort {
  execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<{ approvals: unknown[]; total: number }>;
}
