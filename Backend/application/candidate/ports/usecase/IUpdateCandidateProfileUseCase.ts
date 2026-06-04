import type {
  IUpdateCandidateProfileInputDTO,
  IUpdateCandidateProfileOutputDTO,
} from '../../dtos/CandidateProfileDTO.js';

export interface IUpdateCandidateProfileUseCase {
  execute(dto: IUpdateCandidateProfileInputDTO): Promise<IUpdateCandidateProfileOutputDTO>;
}
