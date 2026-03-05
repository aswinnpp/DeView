import type { ICheckCompanyStatusDTO } from '../dtos/CheckCompanyStatusDTO.js';
import type { ISubmitCompanyApprovalDTO } from '../dtos/SubmitCompanyApprovalDTO.js';
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
  toCheckStatusDTO(context: CallerContext): ICheckCompanyStatusDTO {
    return { userId: context.userId };
  },

  toSubmitDTO(body: ISubmitApprovalBody, context: CallerContext): ISubmitCompanyApprovalDTO {
    return {
      userId: context.userId,
      ...body,
    };
  },
};
