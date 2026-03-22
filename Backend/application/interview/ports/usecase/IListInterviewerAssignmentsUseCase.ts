import type {
  IListInterviewerAssignmentsInputDTO,
  IListInterviewerAssignmentsOutputDTO,
} from '../../dtos/InterviewListDTO.js';

export interface IListInterviewerAssignmentsUseCase {
  execute(input: IListInterviewerAssignmentsInputDTO): Promise<IListInterviewerAssignmentsOutputDTO>;
}
