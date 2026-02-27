import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetCompanyProfileUseCase } from "../../../application/company/ports/usecase/IGetCompanyProfileUseCase";
import type { IUpdateCompanyProfileUseCase } from "../../../application/company/ports/usecase/IUpdateCompanyProfileUseCase";
import { CompanyProfileMapper } from "../mappers/company-profile.mapper.js";

interface IUpdateProfileBody {
  companyName?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  website?: string;
  numberOfEmployees?: string;
}

type GetProfileQuery = {
  page?: string;
  limit?: string;
};

@injectable()
export class CompanyProfileController {
  constructor(
    @inject(TYPES.GetCompanyProfileUseCasePort) private readonly getProfileUseCase: IGetCompanyProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCasePort) private readonly updateProfileUseCase: IUpdateCompanyProfileUseCase,
  ) {}

  getProfile = async (
    request: FastifyRequest<{ Querystring: GetProfileQuery }>,
    reply: FastifyReply,
  ) => {
    const user = request.currentUser;

    const profile = await this.getProfileUseCase.execute(user.userId);

    const page = Math.max(1, Number(request.query.page ?? 1) || 1);
    const limit = Math.max(1, Math.min(50, Number(request.query.limit ?? 8) || 8));

    const pending = [...(profile.pendingSubscriptions ?? [])].sort((a, b) => {
      const diff = new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const history = [...(profile.subscriptionHistory ?? [])].sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
    );

    const merged = [...pending, ...history];
    const total = merged.length;
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    const data = {
      ...(profile as unknown as Record<string, unknown>),
      // Hide legacy fields from API response (not needed by UI)
      subscriptionPlanId: undefined,
      subscriptionEndsAt: undefined,
      // Avoid sending large arrays; UI uses paginated merged list
      pendingSubscriptions: undefined,
      subscriptionHistory: undefined,
      subscriptions: {
        items,
        total,
        page,
        limit,
        pendingTotal: pending.length,
        historyTotal: history.length,
      },
    };

    reply.send(success({ data }));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: IUpdateProfileBody }>,
    reply: FastifyReply,
  ) => {
    const dto = CompanyProfileMapper.toUpdateDTO(request.body, request.currentUser);
    const result = await this.updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };
}
