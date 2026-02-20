import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { PasswordHasherPort } from "../ports/services/PasswordHasherPort";
import { TokenServicePort } from "../ports/services/TokenServicePort";
import { AppError } from "../../../shared/errors/AppError";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import type { LoginUseCasePort } from "../ports/usecase/LoginUseCasePort";

@injectable()
export class LoginUseCase implements LoginUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
    @inject(TYPES.CompanyApprovalRepositoryPort) private companyRepo: CompanyApprovalRepositoryPort,
    @inject(TYPES.PasswordHasherPort) private hasher: PasswordHasherPort,
    @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort
  ) { }

  async execute(emailStr: string, password: string) {
    const email = new Email(emailStr);
    const user = await this.userRepo.findByEmail(email);
    let userId = user?.id
    const company = await this.companyRepo.findByUserId(`${userId}`)


    if (company && !company.isActive) {
      throw AppError.unauthorized("Account is deactivated");
    }


    if (!user || !user.passwordHash) {
      throw AppError.unauthorized("Invalid email or password");
    }
    if (!user.isEmailVerified) {
      throw AppError.forbidden("Email not verified");
    }

    const ok = await this.hasher.compare(password, user.passwordHash);
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

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role.getValue(),
      ...(user.companyId && { companyId: user.companyId }),
    });

    const refresh = await this.tokenService.generateRefreshToken(user.id);

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
