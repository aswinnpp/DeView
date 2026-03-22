import type { IResendOtpInputDTO, IResendOtpOutputDTO } from '../../dtos/ResendOtpDTO.js';

export interface IResendOtpUseCase {
  execute(dto: IResendOtpInputDTO): Promise<IResendOtpOutputDTO>;
}
