/** Resend OTP — input + output in one module. */

export interface IResendOtpInputDTO {
  email: string;
}

export interface IResendOtpOutputDTO {
  message: string;
  email: string;
}
