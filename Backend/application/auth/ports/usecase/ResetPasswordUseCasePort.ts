export interface ResetPasswordUseCasePort {
  execute(emailStr: string, otpStr: string, newPassword: string): Promise<void>;
}
