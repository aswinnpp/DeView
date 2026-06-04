export interface ISubscriptionUseCase {
  execute(ctx: { companyId: string }    ): Promise<void>;
}