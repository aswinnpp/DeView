export interface IVerifyOtpUseCase {
  execute(emailStr: string, otpStr: string): Promise<void>;
}
