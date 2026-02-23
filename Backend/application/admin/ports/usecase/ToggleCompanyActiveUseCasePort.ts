export interface AdminToggleActivityUseCasePort {
  execute(id: string): Promise<{ isActive: boolean }>;
}
