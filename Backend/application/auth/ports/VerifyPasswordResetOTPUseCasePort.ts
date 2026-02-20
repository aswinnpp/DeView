export interface VerifyPasswordResetOTPUseCasePort {
  execute(emailStr: string, otpStr: string): Promise<void>;
}
