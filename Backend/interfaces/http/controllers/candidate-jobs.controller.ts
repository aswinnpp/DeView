import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListAllJobsForCandidatesUseCase } from '../../../application/candidate/ports/usecase/IListAllJobsForCandidatesUseCase.js';
import type { IApplyForJobUseCase } from '../../../application/candidate/ports/usecase/IApplyForJobUseCase.js';
import { JobMapper } from '../mappers/index.js';

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
