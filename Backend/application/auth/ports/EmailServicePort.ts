export interface EmailServicePort {
  sendOTP(email: string, otp: string, userName: string): Promise<void>;
  sendPasswordResetOTP(email: string, otp: string, userName: string): Promise<void>;
}
