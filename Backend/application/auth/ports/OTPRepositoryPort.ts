import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";

export interface OTPRepositoryPort {
  save(email: string, otp: OTPCode): Promise<void>;
  find(email: string): Promise<OTPCode | null>;
  delete(email: string): Promise<void>;
}
