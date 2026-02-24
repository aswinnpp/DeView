export interface IEmailService {
  sendOTP(email: string, otp: string, userName: string): Promise<void>;
  sendPasswordResetOTP(email: string, otp: string, userName: string): Promise<void>;
  sendWelcomeEmail(email: string, userName: string, role: string, temporaryPassword: string): Promise<void>;
}
