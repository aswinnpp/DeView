import type {
  IAcceptInterviewAssignmentInputDTO,
  IAcceptInterviewAssignmentOutputDTO,
} from '../../dtos/InterviewCommandDTO.js';

export interface IAcceptInterviewAssignmentUseCase {
  execute(input: IAcceptInterviewAssignmentInputDTO): Promise<IAcceptInterviewAssignmentOutputDTO>;
}
