import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import type { IUserRepository } from '../../shared/ports/repository/IUserRepository';
import type { IPasswordHasher } from '../ports/services/IPasswordHasher';
import { ITokenService } from '../ports/services/ITokenService';
import { AppError } from '../../../shared/errors/AppError';
import type { IChangePasswordUseCase } from '../ports/usecase/IChangePasswordUseCase';

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly _userRepo: IUserRepository,
    @inject(TYPES.PasswordHasherPort) private readonly _hasher: IPasswordHasher,
    @inject(TYPES.TokenServicePort) private readonly _tokenService: ITokenService
  ) {}

  async execute(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
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

    user.passwordHash = await this._hasher.hash(newPassword);
    await this._userRepo.save(user);

    // Invalidate all existing access + refresh tokens for this user
    // so they must re-login with the new credentials.
    await this._tokenService.revokeAllUserTokens(user.id!);
  }
}

