import type { ICreateSubscribtionInput } from "./IAdmin-CreateSubscribtionUsecase";

export type IUpdateSubscribtionInput = ICreateSubscribtionInput;

export interface IAdminUpdateSubscribtionUsecase {
  execute(id: string, input: IUpdateSubscribtionInput): Promise<void>;
}

