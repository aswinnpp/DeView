import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';
import type {
  ICreateJobInputDTO,
  IUpdateJobInputDTO,
  IListJobsInputDTO,
} from '../dtos/JobDTO.js';
import type { JobStatus } from '../../../domain/entities/Job.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';

export interface IJobListQuery {
  search?: string;
  status?: JobStatus;
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const JobMapper = {
  toCreateDTO(body: JobFormValues, context: CallerContext): ICreateJobInputDTO {
    return {
      ...body,
      companyId: context.companyId || '',
      userId: context.userId,
    };
  },

  toUpdateDTO(
    params: { id: string },
    body: Partial<JobFormValues>,
    context: CallerContext
  ): IUpdateJobInputDTO {
    return {
      jobId: params.id,
      companyId: context.companyId || '',
      userId: context.userId,
      data: body,
    };
  },

  toListInput(query: IJobListQuery | undefined, context: CallerContext): IListJobsInputDTO {
    const page = query?.page != null ? Number(query.page) : Number.NaN;
    const limit = query?.limit != null ? Number(query.limit) : Number.NaN;
    return {
      companyId: context.companyId || '',
      search: query?.search,
      status: query?.status,
      page: Number.isFinite(page) && page >= 1 ? page : undefined,
      limit: Number.isFinite(limit) && limit >= 1 ? limit : undefined,
    };
  },

  toToggleStatusInput(
    params: { id: string },
    body: { status: JobStatus },
    context: CallerContext
  ) {
    return {
      jobId: params.id,
      companyId: context.companyId || '',
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
