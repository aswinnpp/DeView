import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { IPasswordHasher } from "../ports/services/IPasswordHasher";
import { ITokenService } from "../ports/services/ITokenService";
import { AppError } from "../../../shared/errors/AppError";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import type { ILoginUseCase } from "../ports/usecase/ILoginUseCase";

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private _companyRepo: ICompanyProfileRepository,
    @inject(TYPES.PasswordHasherPort) private _hasher: IPasswordHasher,
    @inject(TYPES.TokenServicePort) private _tokenService: ITokenService
  ) { }

  async execute(emailStr: string, password: string) {
    const email = new Email(emailStr);
    const user = await this._userRepo.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized("Invalid email or password");
    }
   
  



   
    if (!user.isEmailVerified) {
      throw AppError.forbidden("Email not verified");
    }

    const ok = await this._hasher.compare(password, user.passwordHash);
    if (!ok) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account is deactivated");
    }

    if (!user.id) {
      console.error('ERROR: User ID is null/undefined for user:', user.email.getValue());
      throw AppError.internal("User ID is missing");
    }

    const accessToken = await this._tokenService.signAccessToken({
      userId: user.id,
      role: user.role.getValue(),
      ...(user.companyId && { companyId: user.companyId }),
    });

    const refresh = await this._tokenService.generateRefreshToken(user.id);

    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email.getValue(),
      role: user.role.getValue(),
    };


    return {
      user: userData,
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
