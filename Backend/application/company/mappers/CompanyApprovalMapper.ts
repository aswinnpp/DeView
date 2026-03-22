import type {
  ICheckCompanyStatusInputDTO,
  ISubmitCompanyApprovalInputDTO,
} from '../dtos/CompanyApprovalDTO.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';

export interface ISubmitApprovalBody {
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: Record<string, unknown>;
}

export const CompanyApprovalMapper = {
  toCheckStatusDTO(context: CallerContext): ICheckCompanyStatusInputDTO {
    return { userId: context.userId };
  },

  toSubmitDTO(body: ISubmitApprovalBody, context: CallerContext): ISubmitCompanyApprovalInputDTO {
    return {
      userId: context.userId,
      ...body,
    };
  },
};
