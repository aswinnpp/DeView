import type { ICheckCompanyStatusDTO } from "../../../application/company/dtos/CheckCompanyStatusDTO.js";
import type { ISubmitCompanyApprovalDTO } from "../../../application/company/dtos/SubmitCompanyApprovalDTO.js";
import type { IAuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request */
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


export const CompanyApprovalMapper = {
  toCheckStatusDTO(user: IAuthenticatedUser): ICheckCompanyStatusDTO {
    return { userId: user.userId };
  },

  toSubmitDTO(body: ISubmitApprovalBody, user: IAuthenticatedUser): ISubmitCompanyApprovalDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
