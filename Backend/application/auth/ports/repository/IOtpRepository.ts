import { OTPCode } from "../../../../domain/value-objects/OTPCode";

export interface IOtpRepository {
  save(email: string, otp: OTPCode): Promise<void>;
  find(email: string): Promise<OTPCode | null>;
  delete(email: string): Promise<void>;
}
