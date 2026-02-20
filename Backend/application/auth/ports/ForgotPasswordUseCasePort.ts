export interface ForgotPasswordUseCasePort {
  execute(emailStr: string): Promise<void>;
}
