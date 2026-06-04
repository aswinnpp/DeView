import type {
  IListPendingApplicationsForJobInputDTO,
  IListPendingApplicationsForJobOutputDTO,
} from '../../dtos/PendingApplicationsForJobDTO.js';

export interface IListPendingApplicationsForJobUseCase {
  execute(
    input: IListPendingApplicationsForJobInputDTO
  ): Promise<IListPendingApplicationsForJobOutputDTO>;
}
