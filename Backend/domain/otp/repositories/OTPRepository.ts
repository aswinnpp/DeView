export interface OTPRepository {
    saveOTP(email: string, otp: string): Promise<void>;
    findOTP(email: string): Promise<string | null>;
    deleteOTP(email: string): Promise<void>;
}
