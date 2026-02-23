import type { UpdateCompanyProfileDTO } from "../../../application/company/dtos/UpdateCompanyProfileDTO.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request (flat fields after schema transform) */
interface UpdateProfileBody {
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
  toUpdateDTO(body: UpdateProfileBody, user: AuthenticatedUser): UpdateCompanyProfileDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
