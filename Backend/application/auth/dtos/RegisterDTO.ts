/** Registration — input + output in one module. */

export interface IRegisterUserInputDTO {
  fullName: string;
  email: string;
  password: string;
  role: 'candidate' | 'company';
  companyId?: string;
}

export interface IRegisterUserOutputDTO {
  message: string;
  email: string;
}
