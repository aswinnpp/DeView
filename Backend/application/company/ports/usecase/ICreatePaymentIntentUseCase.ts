export interface ICreatePaymentIntentInput {
  companyId: string;
  planId: string;
}

export interface ICreatePaymentIntentResult {
  clientSecret: string;
}

export interface ICreatePaymentIntentUseCase {
  execute(input: ICreatePaymentIntentInput): Promise<ICreatePaymentIntentResult>;
}
