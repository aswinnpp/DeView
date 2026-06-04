export interface IVerifyPasswordResetOtpUseCase {
  execute(emailStr: string, otpStr: string): Promise<void>;
}
