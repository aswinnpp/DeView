import { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from 'inversify';
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import { SubscriptionMapper } from "../../../application/admin/mappers/SubscriptionMapper.js";
import type { IAdminCreateSubscription } from "../../../application/admin/ports/usecase/IAdmin-CreateSubscriptionUsecase";
import type { ICreateSubscriptionInputDTO } from "../../../application/admin/dtos/CreateSubscriptionDTO.js";
import type {
  IAdminListSubscriptionsUsecase,
} from "../../../application/admin/ports/usecase/IAdmin-ListSubscriptionsUsecase";
import type { IAdminToggleSubscriptionStatusUsecase } from "../../../application/admin/ports/usecase/IAdmin-ToggleSubscriptionStatusUsecase";
import type {
  IAdminUpdateSubscriptionUsecase,
  IUpdateSubscriptionInput,
} from "../../../application/admin/ports/usecase/IAdmin-UpdateSubscriptionUsecase";

type CreateSubscriptionBody = ICreateSubscriptionInputDTO;
type UpdateSubscriptionBody = IUpdateSubscriptionInput;
type ListSubscriptionsQuery = {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
};

@injectable()
export class AdminSubscriptionController {
  constructor(
    @inject(TYPES.CreateSubscriptionUsecasePort)
    private readonly createSubscriptionUsecase: IAdminCreateSubscription,
    @inject(TYPES.ListSubscriptionsUsecasePort)
    private readonly listSubscriptionsUsecase: IAdminListSubscriptionsUsecase,
    @inject(TYPES.ToggleSubscriptionStatusUsecasePort)
    private readonly toggleSubscriptionStatusUsecase: IAdminToggleSubscriptionStatusUsecase,
    @inject(TYPES.UpdateSubscriptionUsecasePort)
    private readonly updateSubscriptionUsecase: IAdminUpdateSubscriptionUsecase,
  ) {}

  create = async (
    request: FastifyRequest<{ Body: CreateSubscriptionBody }>,
    reply: FastifyReply,
  ) => {
    await this.createSubscriptionUsecase.execute(request.body);

    reply
      .status(HttpStatus.CREATED)
      .send(success({ message: "Subscription plan created successfully" }));
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSubscriptionBody }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params;
    await this.updateSubscriptionUsecase.execute(id, request.body);

    reply
      .status(HttpStatus.OK)
      .send(success({ message: "Subscription plan updated successfully" }));
  };

  list = async (
    request: FastifyRequest<{ Querystring: ListSubscriptionsQuery }>,
    reply: FastifyReply,
  ) => {
    const input = SubscriptionMapper.toListInput(request.query);
    const result = await this.listSubscriptionsUsecase.execute(input);

    reply
      .status(HttpStatus.OK)
      .send(success(result));
  };

  toggle = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params;
    const result = await this.toggleSubscriptionStatusUsecase.execute(id);

    reply
      .status(HttpStatus.OK)
      .send(success(result));
  };
}
