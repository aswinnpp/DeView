export interface IAdminToggleSubscriptionStatusUsecase {
  execute(id: string): Promise<{ isActive: boolean }>;
}
