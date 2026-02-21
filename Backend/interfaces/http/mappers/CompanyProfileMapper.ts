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

/**
 * Maps HTTP request data to Company Profile UseCase DTOs.
 * Combines validated body + authenticated user (userId).
 */
export const CompanyProfileMapper = {
  /** PUT /company/profile — update company profile */
  toUpdateDTO(body: UpdateProfileBody, user: AuthenticatedUser): UpdateCompanyProfileDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
