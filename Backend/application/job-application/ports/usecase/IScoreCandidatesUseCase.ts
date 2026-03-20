import type {
  IScoreCandidatesInputDTO,
  IScoreCandidatesResultDTO,
} from '../../dtos/ScoreCandidatesDTO.js';

export interface IScoreCandidatesUseCase {
  execute(input: IScoreCandidatesInputDTO): Promise<IScoreCandidatesResultDTO>;
}
