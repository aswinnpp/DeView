/** Email OTP verification — input + output in one module. */

export interface IVerifyOtpInputDTO {
  email: string;
  otp: string;
}

export type IVerifyOtpOutputDTO = void;
