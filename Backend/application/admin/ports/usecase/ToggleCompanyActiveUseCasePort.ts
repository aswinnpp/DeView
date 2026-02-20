export interface ToggleCompanyActiveUseCasePort {
  execute(id: string): Promise<{ isActive: boolean }>;
}
