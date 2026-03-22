/** Company profile update — input + output in one module. */

export interface IUpdateCompanyProfileInputDTO {
  userId: string;
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

export interface IUpdateCompanyProfileOutputDTO {
  message: string;
}
