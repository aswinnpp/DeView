export interface IDeleteNotificationUseCase {
  execute(input: { companyId: string; notificationId: string }): Promise<{ ok: boolean }>;
}

