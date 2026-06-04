import type {
  IScoreCandidatesInputDTO,
  IScoreCandidatesOutputDTO,
} from '../../dtos/ScoreCandidatesDTO.js';

export interface IScoreCandidatesUseCase {
  execute(input: IScoreCandidatesInputDTO): Promise<IScoreCandidatesOutputDTO>;
}
