export interface GetPendingCompaniesUseCasePort {
  execute(search?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<{ data: unknown[]; total: number }>;
}
