export interface IResetPasswordUseCase {
  execute(emailStr: string, otpStr: string, newPassword: string): Promise<void>;
}
