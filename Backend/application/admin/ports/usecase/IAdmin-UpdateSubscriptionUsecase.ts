import type { ICreateSubscriptionInput } from "./IAdmin-CreateSubscriptionUsecase";

export type IUpdateSubscriptionInput = ICreateSubscriptionInput;

export interface IAdminUpdateSubscriptionUsecase {
  execute(id: string, input: IUpdateSubscriptionInput): Promise<void>;
}
