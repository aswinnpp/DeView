import type {
  IGetInterviewRoomDetailsInputDTO,
  IGetInterviewRoomDetailsOutputDTO,
} from '../../dtos/InterviewRoomDTO.js';

export interface IGetInterviewRoomDetailsUseCase {
  execute(input: IGetInterviewRoomDetailsInputDTO): Promise<IGetInterviewRoomDetailsOutputDTO>;
}
