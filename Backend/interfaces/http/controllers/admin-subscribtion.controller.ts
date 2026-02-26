import { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from 'inversify';
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IAdminCreateSubscribtion, ICreateSubscribtionInput } from "../../../application/admin/ports/usecase/IAdmin-CreateSubscribtionUsecase";
import type {
  IAdminListSubscribtionsUsecase,
  IListSubscribtionsInput,
} from "../../../application/admin/ports/usecase/IAdmin-ListSubscribtionsUsecase";
import type { IAdminToggleSubscribtionStatusUsecase } from "../../../application/admin/ports/usecase/IAdmin-ToggleSubscribtionStatusUsecase";
import type {
  IAdminUpdateSubscribtionUsecase,
  IUpdateSubscribtionInput,
} from "../../../application/admin/ports/usecase/IAdmin-UpdateSubscribtionUsecase";

type CreateSubscribtionBody = ICreateSubscribtionInput;
type UpdateSubscribtionBody = IUpdateSubscribtionInput;
type ListSubscribtionsQuery = {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
};

@injectable()
export class AdminSubscribtionController {
  constructor(
    @inject(TYPES.CreateSubscribtioUsecasePort)
    private readonly createSubscribtionUsecase: IAdminCreateSubscribtion,
    @inject(TYPES.ListSubscribtionsUsecasePort)
    private readonly listSubscribtionsUsecase: IAdminListSubscribtionsUsecase,
    @inject(TYPES.ToggleSubscribtionStatusUsecasePort)
    private readonly toggleSubscribtionStatusUsecase: IAdminToggleSubscribtionStatusUsecase,
    @inject(TYPES.UpdateSubscribtionUsecasePort)
    private readonly updateSubscribtionUsecase: IAdminUpdateSubscribtionUsecase,
  ) {}

  subcribtion = async (
    request: FastifyRequest<{ Body: CreateSubscribtionBody }>,
    reply: FastifyReply,
  ) => {
    await this.createSubscribtionUsecase.execute(request.body);

    reply
      .status(HttpStatus.CREATED)
      .send(success({ message: "Subscription plan created successfully" }));
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSubscribtionBody }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params;
    await this.updateSubscribtionUsecase.execute(id, request.body);

    reply
      .status(HttpStatus.OK)
      .send(success({ message: "Subscription plan updated successfully" }));
  };

  list = async (
    request: FastifyRequest<{ Querystring: ListSubscribtionsQuery }>,
    reply: FastifyReply,
  ) => {
    const {
      search,
      status,
      duration,
      sortOrder,
      page,
      limit,
    } = request.query;

    const input: IListSubscribtionsInput = {
      search,
      status,
      duration,
      sortOrder,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await this.listSubscribtionsUsecase.execute(input);

    reply
      .status(HttpStatus.OK)
      .send(success(result));
  };

  toggle = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params;
    const result = await this.toggleSubscribtionStatusUsecase.execute(id);

    reply
      .status(HttpStatus.OK)
      .send(success(result));
  };
}
