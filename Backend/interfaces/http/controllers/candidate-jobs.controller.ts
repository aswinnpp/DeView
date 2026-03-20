import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListAllJobsForCandidatesUseCase } from '../../../application/candidate/ports/usecase/IListAllJobsForCandidatesUseCase.js';
import type { IApplyForJobUseCase } from '../../../application/candidate/ports/usecase/IApplyForJobUseCase.js';
import type { IListMyApplicationsUseCase } from '../../../application/candidate/ports/usecase/IListMyApplicationsUseCase.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ApplicationMapper } from '../../../application/job-application/mappers/ApplicationMapper.js';

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
    private readonly _listAllJobsUseCase: IListAllJobsForCandidatesUseCase,
    @inject(TYPES.ApplyForJobUseCasePort)
    private readonly _applyForJobUseCase: IApplyForJobUseCase,
    @inject(TYPES.ListMyApplicationsUseCasePort)
    private readonly _listMyApplicationsUseCase: IListMyApplicationsUseCase,
  ) {}

  applyForJob = async (
    request: FastifyRequest<{ Params: ApplyParams; Body: ApplyBody }>,
    reply: FastifyReply
  ) => {
    const { jobId } = request.params;
    const body = request.body;
    const userId = request.currentUser.userId;

    const result = await this._applyForJobUseCase.execute({
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
        status?:
          | 'PENDING'
          | 'SHORTLISTED'
          | 'INTERVIEW_SCHEDULED'
          | 'INTERVIEW_COMPLETE'
          | 'COMPLETED'
          | 'HIRED'
          | 'REJECTED'
          | 'RESCHEDULE_REQUESTED';
        page?: number | string;
        limit?: number | string;
        sortOrder?: 'asc' | 'desc';
      };
    }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;

    const result = await this._listMyApplicationsUseCase.execute(
      ApplicationMapper.toListMyApplicationsInput({
        candidateUserId: userId,
        search: request.query.search,
        status: request.query.status,
        page: request.query.page,
        limit: request.query.limit,
        sortOrder: request.query.sortOrder,
      }),
    );

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
    const result = await this._listAllJobsUseCase.execute(input);
    reply.send(success(result));
  };
}
