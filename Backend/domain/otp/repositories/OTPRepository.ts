
import { OTPCode } from "../value-objects/OTPCode";

export interface OTPRepository {
  save(email: string, otp: OTPCode): Promise<void>;
  find(email: string): Promise<OTPCode | null>;
  delete(email: string): Promise<void>;
}
