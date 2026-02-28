import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';
import type { IAuthenticatedUser } from '../middleware/authMiddleware.js';
import type { ICreateJobDTO } from '../../../application/job/dtos/CreateJobDTO.js';
import type { IUpdateJobDTO } from '../../../application/job/dtos/UpdateJobDTO.js';
import type { IListJobsInput } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { JobStatus } from '../../../domain/job/entities/Job.js';

interface IJobListQuery {
  search?: string;
  status?: JobStatus;
}

export const JobMapper = {
  toCreateDTO(body: JobFormValues, user: IAuthenticatedUser): ICreateJobDTO {
    return {
      ...body,
      companyId: user.companyId || '',
      userId: user.userId,
    };
  },

  toUpdateDTO(
    params: { id: string },
    body: Partial<JobFormValues>,
    user: IAuthenticatedUser
  ): IUpdateJobDTO {
    return {
      jobId: params.id,
      companyId: user.companyId || '',
      userId: user.userId,
      data: body,
    };
  },

  toListInput(query: IJobListQuery | undefined, user: IAuthenticatedUser): IListJobsInput {
    return {
      companyId: user.companyId || '',
      search: query?.search,
      status: query?.status,
    };
  },

  toToggleStatusInput(
    params: { id: string },
    body: { status: JobStatus },
    user: IAuthenticatedUser
  ) {
    return {
      jobId: params.id,
      companyId: user.companyId || '',
      status: body.status,
    };
  },
};

