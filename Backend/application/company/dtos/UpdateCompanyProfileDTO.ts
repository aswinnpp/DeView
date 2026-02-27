export interface IUpdateCompanyProfileDTO {
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
}
