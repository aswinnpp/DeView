import type { IResendOtpRequestDTO } from "../../dtos/ResendOTPRequestDTO";
import type { IResendOtpResponseDTO } from "../../dtos/ResendOTPResponseDTO";

export interface IResendOtpUseCase {
  execute(dto: IResendOtpRequestDTO): Promise<IResendOtpResponseDTO>;
}
