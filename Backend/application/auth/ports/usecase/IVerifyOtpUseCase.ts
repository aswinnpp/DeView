import type { IVerifyOtpInputDTO, IVerifyOtpOutputDTO } from '../../dtos/VerifyOtpDTO.js';

export interface IVerifyOtpUseCase {
  execute(input: IVerifyOtpInputDTO): Promise<IVerifyOtpOutputDTO>;
}
