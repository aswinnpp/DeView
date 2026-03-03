import type {
  IListPendingApplicationsForJobInput,
  IListPendingApplicationsForJobResult,
} from '../../dtos/ListPendingApplicationsForJobDTO.js';

export interface IListPendingApplicationsForJobUseCase {
  execute(input: IListPendingApplicationsForJobInput): Promise<IListPendingApplicationsForJobResult>;
}
