import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { HttpStatus } from '../../../shared/http/HttpStatus';
import { TYPES } from '../../../infrastructure/di/types';
import type { ICreateJobUseCase } from '../../../application/job/ports/usecase/ICreateJobUseCase.js';
import type { IUpdateJobUseCase } from '../../../application/job/ports/usecase/IUpdateJobUseCase.js';
import type { IListJobsUseCase } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { IToggleJobStatusUseCase } from '../../../application/job/ports/usecase/IToggleJobStatusUseCase.js';
import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';
import type { JobStatus } from '../../../domain/job/entities/Job.js';
import { JobMapper } from '../mappers/index.js';

@injectable()
export class jobController {
  constructor(
    @inject(TYPES.CreateJobUseCasePort) private readonly createJobUseCase: ICreateJobUseCase,
    @inject(TYPES.UpdateJobUseCasePort) private readonly updateJobUseCase: IUpdateJobUseCase,
    @inject(TYPES.ListJobsUseCasePort) private readonly listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.ToggleJobStatusUseCasePort) private readonly toggleJobStatusUseCase: IToggleJobStatusUseCase,
  ) {}

  createJob = async (
    request: FastifyRequest<{ Body: JobFormValues }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const dto = JobMapper.toCreateDTO(request.body, user);
    const result = await this.createJobUseCase.execute(dto);

    reply.code(HttpStatus.CREATED).send(success(result.job));
  };

  updateJob = async (
    request: FastifyRequest<{ Params: { id: string }; Body: Partial<JobFormValues> }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const dto = JobMapper.toUpdateDTO(request.params, request.body, user);
    const result = await this.updateJobUseCase.execute(dto);

    reply.send(success(result.job));
  };

  toggleStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { status: JobStatus } }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const input = JobMapper.toToggleStatusInput(request.params, request.body, user);
    const result = await this.toggleJobStatusUseCase.execute(input);

    reply.send(success(result.job));
  };

  getJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; page?: number; limit?: number };
    }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const input = JobMapper.toListInput(request.query, user);
    const result = await this.listJobsUseCase.execute(input);

    reply.send(success(result));
  };
}
