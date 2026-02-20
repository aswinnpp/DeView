export interface LoginUseCasePort {
  execute(emailStr: string, password: string): Promise<{
    user: { id: string; fullName: string; email: string; role: string };
    accessToken: string;
    refreshToken: string;
  }>;
}
