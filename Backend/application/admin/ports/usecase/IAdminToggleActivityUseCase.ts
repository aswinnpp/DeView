export interface IAdminToggleActivityUseCase {
  execute(id: string): Promise<{ isActive: boolean }>;
}
