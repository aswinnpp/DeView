export interface IAdminToggleSubscribtionStatusUsecase {
  execute(id: string): Promise<{ isActive: boolean }>;
}

