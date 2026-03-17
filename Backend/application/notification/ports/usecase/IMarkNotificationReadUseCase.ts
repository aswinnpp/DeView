export interface IMarkNotificationReadUseCase {
  execute(input: { companyId: string; notificationId: string }): Promise<{ ok: boolean }>;
}

