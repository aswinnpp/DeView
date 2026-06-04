import type {
  ICreateCandidateProfileInputDTO,
  ICreateCandidateProfileOutputDTO,
} from '../../dtos/CandidateProfileDTO.js';

export interface ICreateCandidateProfileUseCase {
  execute(dto: ICreateCandidateProfileInputDTO): Promise<ICreateCandidateProfileOutputDTO>;
}
