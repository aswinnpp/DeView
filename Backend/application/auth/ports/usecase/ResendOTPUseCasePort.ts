import type { ResendOTPRequestDTO } from "../../dtos/ResendOTPRequestDTO";
import type { ResendOTPResponseDTO } from "../../dtos/ResendOTPResponseDTO";

export interface ResendOTPUseCasePort {
  execute(dto: ResendOTPRequestDTO): Promise<ResendOTPResponseDTO>;
}
