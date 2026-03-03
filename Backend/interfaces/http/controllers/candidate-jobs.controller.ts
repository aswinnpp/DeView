import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListAllJobsForCandidatesUseCase } from '../../../application/candidate/ports/usecase/IListAllJobsForCandidatesUseCase.js';
import type { IApplyForJobUseCase } from '../../../application/candidate/ports/usecase/IApplyForJobUseCase.js';
import type { IListMyApplicationsUseCase } from '../../../application/candidate/ports/usecase/IListMyApplicationsUseCase.js';
import { JobMapper } from '../mappers/index.js';
import { ApplicationMapper } from '../mappers/index.js';

interface ApplyBody {
  useResumeFromProfile: boolean;
  coverLetter?: string;
  resumeUrl?: string;
}

interface ApplyParams {
  jobId: string;
}

@injectable()
export class CandidateJobsController {
  constructor(
    @inject(TYPES.ListAllJobsForCandidatesUseCasePort)
    private readonly listAllJobsUseCase: IListAllJobsForCandidatesUseCase,
    @inject(TYPES.ApplyForJobUseCasePort)
    private readonly applyForJobUseCase: IApplyForJobUseCase,
    @inject(TYPES.ListMyApplicationsUseCasePort)
    private readonly listMyApplicationsUseCase: IListMyApplicationsUseCase,
  ) {}

  applyForJob = async (
    request: FastifyRequest<{ Params: ApplyParams; Body: ApplyBody }>,
    reply: FastifyReply
  ) => {
    const { jobId } = request.params;
    const body = request.body;
    const userId = request.currentUser.userId;

    const result = await this.applyForJobUseCase.execute({
      jobId,
      candidateUserId: userId,
      useResumeFromProfile: body.useResumeFromProfile,
      coverLetter: body.coverLetter,
      resumeUrl: body.resumeUrl,
    });

    reply.send(success(result));
  };

  listMyApplications = async (
    request: FastifyRequest<{
      Querystring: {
        search?: string;
        status?: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
        page?: number;
        limit?: number;
        sortOrder?: 'asc' | 'desc';
      };
    }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;

    const page =
      typeof request.query.page === 'number'
        ? request.query.page
        : request.query.page != null
        ? Number(request.query.page)
        : undefined;
    const limit =
      typeof request.query.limit === 'number'
        ? request.query.limit
        : request.query.limit != null
        ? Number(request.query.limit)
        : undefined;

    const result = await this.listMyApplicationsUseCase.execute({
      candidateUserId: userId,
      search: request.query.search,
      status: request.query.status,
      page,
      limit,
      sortOrder: request.query.sortOrder,
    });

    const data = ApplicationMapper.toListView(result.data);
    reply.send(success({ data, total: result.total }));
  };

  getAllJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; jobType?: string; page?: number; limit?: number; sortBy?: 'date' | 'salary' | 'title'; sortOrder?: 'asc' | 'desc' };
    }>,
    reply: FastifyReply
  ) => {
    const input = JobMapper.toListAllForCandidatesInput(request.query);
    const result = await this.listAllJobsUseCase.execute(input);
    reply.send(success(result));
  };
}
