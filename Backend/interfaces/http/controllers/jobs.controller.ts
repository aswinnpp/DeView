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
import type { JobStatus } from '../../../domain/entities/Job.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ISubscriptionUseCase } from '../../../application/job/ports/usecase/ISubscription';

function toContext(user: { userId: string; companyId?: string }) {
  return { userId: user.userId, companyId: user.companyId };
}

@injectable()
export class JobsController {
  constructor(
    @inject(TYPES.CreateJobUseCasePort) private readonly _createJobUseCase: ICreateJobUseCase,
    @inject(TYPES.UpdateJobUseCasePort) private readonly _updateJobUseCase: IUpdateJobUseCase,
    @inject(TYPES.ListJobsUseCasePort) private readonly _listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.ToggleJobStatusUseCasePort) private readonly _toggleJobStatusUseCase: IToggleJobStatusUseCase,
    @inject(TYPES.SubscriptionUseCasePort) private readonly _subscriptionUseCase: ISubscriptionUseCase,
  ) {}

  createJob = async (
    request: FastifyRequest<{ Body: JobFormValues }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const dto = JobMapper.toCreateDTO(request.body, ctx);
    const result = await this._createJobUseCase.execute(dto);

    reply.code(HttpStatus.CREATED).send(success(result.job));
  };

  updateJob = async (
    request: FastifyRequest<{ Params: { id: string }; Body: Partial<JobFormValues> }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const dto = JobMapper.toUpdateDTO(request.params, request.body, ctx);
    const result = await this._updateJobUseCase.execute(dto);

    reply.send(success(result.job));
  };

  toggleStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { status: JobStatus } }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = JobMapper.toToggleStatusInput(request.params, request.body, ctx);
    const result = await this._toggleJobStatusUseCase.execute(input);

    reply.send(success(result.job));
  };

  getJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; page?: number; limit?: number };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = JobMapper.toListInput(request.query, ctx);
    const result = await this._listJobsUseCase.execute(input);


    reply.send(success(result));
  };

  subscription = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const result = await this._subscriptionUseCase.execute({ companyId: ctx.companyId ?? '' });
    reply.send(success(result));
  };
}
