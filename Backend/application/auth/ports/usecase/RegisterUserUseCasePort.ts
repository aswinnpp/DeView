export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterUserUseCasePort {
  execute(dto: RegisterUserDTO): Promise<{ message: string; email: string }>;
}
