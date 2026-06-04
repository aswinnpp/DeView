import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import type { IUserRepository } from '../../shared/ports/repository/IUserRepository';
import type { IPasswordHasher } from '../ports/services/IPasswordHasher';
import { AppError } from '../../../shared/errors/AppError';
import type { IVerifyOldPasswordUseCase } from '../ports/usecase/IVerifyOldPasswordUseCase';

@injectable()
export class VerifyOldPasswordUseCase implements IVerifyOldPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly _userRepo: IUserRepository,
    @inject(TYPES.PasswordHasherPort) private readonly _hasher: IPasswordHasher
  ) {}

  async execute(userId: string, oldPassword: string): Promise<void> {
    const user = await this._userRepo.findById(userId);

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (!user.passwordHash) {
      throw AppError.unauthorized('Invalid old password');
    }

    const ok = await this._hasher.compare(oldPassword, user.passwordHash);
    if (!ok) {
      throw AppError.unauthorized('Invalid old password');
    }
  }
}

