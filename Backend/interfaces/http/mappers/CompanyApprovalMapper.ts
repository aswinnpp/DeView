import type { CheckCompanyStatusDTO } from "../../../application/company/dtos/CheckCompanyStatusDTO.js";
import type { SubmitCompanyApprovalDTO } from "../../../application/company/dtos/SubmitCompanyApprovalDTO.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request */
interface SubmitApprovalBody {
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
  toCheckStatusDTO(user: AuthenticatedUser): CheckCompanyStatusDTO {
    return { userId: user.userId };
  },

  toSubmitDTO(body: SubmitApprovalBody, user: AuthenticatedUser): SubmitCompanyApprovalDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
