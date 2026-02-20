export interface VerifyOTPUseCasePort {
  execute(emailStr: string, otpStr: string): Promise<void>;
}
