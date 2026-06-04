export interface IVerifyOldPasswordUseCase {
  execute(userId: string, oldPassword: string): Promise<void>;
}

