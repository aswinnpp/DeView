import { injectable, inject } from "inversify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { TYPES } from "../../../infrastructure/di/types.js";
import { success } from "../../../shared/http/apiResponse.js";
import { HttpStatus } from "../../../shared/http/HttpStatus.js";
import type { InterviewerSlotsUpsertBody } from "../../../../Shared/contracts/interviewer/interviewerSlots.schema.js";
import type { IGetMyInterviewerSlotsUseCase } from "../../../application/interviewer/ports/usecase/IGetMyInterviewerSlotsUseCase.js";
import type { IUpsertMyInterviewerSlotsUseCase } from "../../../application/interviewer/ports/usecase/IUpsertMyInterviewerSlotsUseCase.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class InterviewerSlotsController {
  constructor(
    @inject(TYPES.GetMyInterviewerSlotsUseCasePort)
    private readonly getMySlotsUseCase: IGetMyInterviewerSlotsUseCase,
    @inject(TYPES.UpsertMyInterviewerSlotsUseCasePort)
    private readonly upsertMySlotsUseCase: IUpsertMyInterviewerSlotsUseCase,
  ) {}

  getMySlots = async (request: FastifyRequest, reply: FastifyReply) => {
    const interviewerId = request.currentUser!.userId;
    const companyId = request.currentUser!.companyId;
    if (!companyId) throw AppError.forbidden("No company associated with this account");

    const { slotDate } = (request.query ?? {}) as { slotDate?: string };
    const docs = await this.getMySlotsUseCase.execute({ interviewerId, companyId, slotDate });
    reply.send(success(docs));
  };

  upsertMySlots = async (
    request: FastifyRequest<{ Body: InterviewerSlotsUpsertBody }>,
    reply: FastifyReply,
  ) => {
    const interviewerId = request.currentUser!.userId;
    const companyId = request.currentUser!.companyId ?? request.body.companyId;
    if (!companyId) throw AppError.badRequest("companyId is required");
    const { slotDate, times } = request.body;
    const booked = request.body.booked ?? false;
    const doc = await this.upsertMySlotsUseCase.execute({
      interviewerId,
      companyId,
      slotDate,
      times,
      booked,
    });
    reply.code(HttpStatus.CREATED).send(success(doc));
  };
}

