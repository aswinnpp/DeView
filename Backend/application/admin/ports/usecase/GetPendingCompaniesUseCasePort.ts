export interface GetPendingCompaniesUseCasePort {
  execute(search?: string): Promise<unknown>;
}
