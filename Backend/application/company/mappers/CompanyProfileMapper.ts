import type { IUpdateCompanyProfileInputDTO } from '../dtos/CompanyProfileDTO.js';
import type { CompanyApproval } from '../../../domain/entities/CompanyApprovalEntitie.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';

export interface IUpdateProfileBody {
  companyName?: string;
  location?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  website?: string;
  numberOfEmployees?: string;
  logoUrl?: string;
}

export const CompanyProfileMapper = {
  toUpdateDTO(body: IUpdateProfileBody, context: CallerContext): IUpdateCompanyProfileInputDTO {
    return {
      userId: context.userId,
      ...body,
    };
  },

  toProfileResponse(profile: CompanyApproval, opts: { page: number; limit: number }) {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.max(1, Math.min(50, opts.limit || 8));

    const pending = [...(profile.pendingSubscriptions ?? [])].sort((a, b) => {
      const diff = new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const history = [...(profile.subscriptionHistory ?? [])].sort(
      (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
    );

    // Order: active first, then pending (upcoming), then history (expired)
    const active = profile.activeSubscription ? [profile.activeSubscription] : [];
    const merged = [...active, ...pending, ...history];
    const total = merged.length;
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    return {
      ...(profile as unknown as Record<string, unknown>),
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
  },
};
