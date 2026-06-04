import type {
  IListMyInterviewsInputDTO,
  IListMyInterviewsOutputDTO,
} from '../../dtos/InterviewListDTO.js';

export interface IListMyInterviewsUseCase {
  execute(input: IListMyInterviewsInputDTO): Promise<IListMyInterviewsOutputDTO>;
}
