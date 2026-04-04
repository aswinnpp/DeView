import type { CompanyProfileDataResponse } from "../../mappers/CompanyProfileMapper.js";

export interface IGetCompanyProfileInputDTO {
  userId: string;
  page: number;
  limit: number;
}

export interface IGetCompanyProfileUseCase {
  execute(input: IGetCompanyProfileInputDTO): Promise<CompanyProfileDataResponse>;
}
