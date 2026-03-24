import { injectable, inject } from "inversify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { TYPES } from "../../../infrastructure/di/types.js";
import { success } from "../../../shared/http/apiResponse.js";
import { HttpStatus } from "../../../shared/http/HttpStatus.js";
import type { InterviewerSlotsUpsertBody } from "../../../../Shared/contracts/interviewer/interviewerSlots.schema.js";
import type { IGetMyInterviewerSlotsUseCase } from "../../../application/interviewer/ports/usecase/IGetMyInterviewerSlotsUseCase.js";
import type { IUpsertMyInterviewerSlotsUseCase } from "../../../application/interviewer/ports/usecase/IUpsertMyInterviewerSlotsUseCase.js";
import { InterviewerSlotsMapper } from "../../../application/interviewer/mappers/InterviewerSlotsMapper.js";

@injectable()
export class InterviewerSlotsController {
  constructor(
    @inject(TYPES.GetMyInterviewerSlotsUseCasePort)
    private readonly _getMySlotsUseCase: IGetMyInterviewerSlotsUseCase,
    @inject(TYPES.UpsertMyInterviewerSlotsUseCasePort)
    private readonly _upsertMySlotsUseCase: IUpsertMyInterviewerSlotsUseCase,
  ) {}

  getMySlots = async (request: FastifyRequest, reply: FastifyReply) => {
    const ctx = InterviewerSlotsMapper.toInterviewerContext(request.currentUser!);

    const docs = await this._getMySlotsUseCase.execute(
      InterviewerSlotsMapper.toGetMySlotsInput(ctx.interviewerId, ctx.companyId, request.query ?? {}),
    );
    reply.send(success(docs));
  };

  upsertMySlots = async (
    request: FastifyRequest<{ Body: InterviewerSlotsUpsertBody }>,
    reply: FastifyReply,
  ) => {
    const ctx = InterviewerSlotsMapper.toInterviewerContext(request.currentUser!);
    const doc = await this._upsertMySlotsUseCase.execute(
      InterviewerSlotsMapper.toUpsertInput(
        ctx.interviewerId,
        request.body,
        ctx.companyId,
      ),
    );
    reply.code(HttpStatus.CREATED).send(success(doc));
  };
}

