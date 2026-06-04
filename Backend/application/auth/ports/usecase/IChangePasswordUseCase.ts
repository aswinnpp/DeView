export interface IChangePasswordUseCase {
  execute(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void>;
}

