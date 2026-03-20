import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types';
import type { IGetLandingStatsUseCase } from '../../../application/public/ports/usecase/IGetLandingStatsUseCase.js';

@injectable()
export class LandingStatsController {
  constructor(
    @inject(TYPES.GetLandingStatsUseCasePort) private readonly _getLandingStatsUseCase: IGetLandingStatsUseCase,
  ) {}

  getLandingStats = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const data = await this._getLandingStatsUseCase.execute();
    reply.send(success(data));
  };
}

