import type { IUpdateCompanyProfileDTO } from "../../../application/company/dtos/UpdateCompanyProfileDTO.js";
import type { IAuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request (flat fields after schema transform) */
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


export const CompanyProfileMapper = {
  toUpdateDTO(body: IUpdateProfileBody, user: IAuthenticatedUser): IUpdateCompanyProfileDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
