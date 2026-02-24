export interface IGetPendingCompaniesUseCase {
  execute(search?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string): Promise<{ data: unknown[]; total: number }>;
}
