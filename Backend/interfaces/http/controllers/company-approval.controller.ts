import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import { MESSAGES } from "../../../shared/constants/messages.js";
import type { ICheckCompanyStatusUseCase } from "../../../application/company/ports/usecase/ICheckCompanyStatusUseCase";
import type { ISubmitCompanyApprovalUseCase } from "../../../application/company/ports/usecase/ISubmitCompanyApprovalUseCase";
import type { IGetMyCompanyApprovalUseCase } from "../../../application/company/ports/usecase/IGetMyCompanyApprovalUseCase";
import { CompanyApprovalMapper } from "../../../application/company/mappers/CompanyApprovalMapper.js";

interface ISubmitApprovalBody {
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: Record<string, unknown>;
}

@injectable()
export class CompanyApprovalController {
  constructor(
    @inject(TYPES.CheckCompanyStatusUseCasePort) private readonly _checkStatusUseCase: ICheckCompanyStatusUseCase,
    @inject(TYPES.SubmitCompanyApprovalUseCasePort) private readonly _submitApprovalUseCase: ISubmitCompanyApprovalUseCase,
    @inject(TYPES.GetMyCompanyApprovalUseCasePort) private readonly _getMyApprovalUseCase: IGetMyCompanyApprovalUseCase,
  ) {}

  checkStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
    const dto = CompanyApprovalMapper.toCheckStatusDTO(ctx);
    const result = await this._checkStatusUseCase.execute(dto);
    reply.send(success(result));
  };

  getMyApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;

    const approval = await this._getMyApprovalUseCase.execute(user.userId);

    reply.send(success(approval));
  };

  submit = async (
    request: FastifyRequest<{ Body: ISubmitApprovalBody }>,
    reply: FastifyReply,
  ) => {
    const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
    const dto = CompanyApprovalMapper.toSubmitDTO(request.body, ctx);
    const result = await this._submitApprovalUseCase.execute(dto);
    reply.code(HttpStatus.CREATED).send(success({
      message: MESSAGES.SUCCESS,
      approvalId: result.approvalId,
    }));
  };
}
