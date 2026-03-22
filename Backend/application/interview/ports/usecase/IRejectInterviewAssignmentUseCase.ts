import type {
  IRejectInterviewAssignmentInputDTO,
  IRejectInterviewAssignmentOutputDTO,
} from '../../dtos/InterviewCommandDTO.js';

export interface IRejectInterviewAssignmentUseCase {
  execute(input: IRejectInterviewAssignmentInputDTO): Promise<IRejectInterviewAssignmentOutputDTO>;
}
