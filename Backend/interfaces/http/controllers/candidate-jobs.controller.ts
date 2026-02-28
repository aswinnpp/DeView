import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListAllJobsForCandidatesUseCase } from '../../../application/candidate/ports/usecase/IListAllJobsForCandidatesUseCase.js';
import { JobMapper } from '../mappers/index.js';

@injectable()
export class CandidateJobsController {
  constructor(
    @inject(TYPES.ListAllJobsForCandidatesUseCasePort)
    private readonly listAllJobsUseCase: IListAllJobsForCandidatesUseCase,
  ) {}

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
