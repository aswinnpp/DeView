export interface IRegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  role: string;
  companyId?: string;
}

export interface IRegisterUserUseCase {
  execute(dto: IRegisterUserDTO): Promise<{ message: string; email: string }>;
}
