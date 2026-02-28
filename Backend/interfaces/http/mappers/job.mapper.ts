import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';
import type { IAuthenticatedUser } from '../middleware/authMiddleware.js';
import type { ICreateJobDTO } from '../../../application/job/dtos/CreateJobDTO.js';
import type { IUpdateJobDTO } from '../../../application/job/dtos/UpdateJobDTO.js';
import type { IListJobsInput } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { JobStatus } from '../../../domain/job/entities/Job.js';

interface IJobListQuery {
  search?: string;
  status?: JobStatus;
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
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
    const page = query?.page != null ? Number(query.page) : Number.NaN;
    const limit = query?.limit != null ? Number(query.limit) : Number.NaN;
    return {
      companyId: user.companyId || '',
      search: query?.search,
      status: query?.status,
      page: Number.isFinite(page) && page >= 1 ? page : undefined,
      limit: Number.isFinite(limit) && limit >= 1 ? limit : undefined,
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

  toListAllForCandidatesInput(query: IJobListQuery | undefined) {
    const page = query?.page != null ? Number(query.page) : Number.NaN;
    const limit = query?.limit != null ? Number(query.limit) : Number.NaN;
    return {
      search: query?.search,
      status: query?.status,
      jobType: query?.jobType,
      page: Number.isFinite(page) && page >= 1 ? page : undefined,
      limit: Number.isFinite(limit) && limit >= 1 ? limit : undefined,
      sortBy: query?.sortBy,
      sortOrder: query?.sortOrder,
    };
  },
};

