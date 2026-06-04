export interface IForgotPasswordUseCase {
  execute(emailStr: string): Promise<void>;
}
