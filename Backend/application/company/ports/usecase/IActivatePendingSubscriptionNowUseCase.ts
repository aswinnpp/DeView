export interface IActivatePendingSubscriptionNowInput {
  companyId: string;
  pendingSubscriptionId: string;
}

export interface IActivatePendingSubscriptionNowUseCase {
  execute(input: IActivatePendingSubscriptionNowInput): Promise<void>;
}

