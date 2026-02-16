import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { TokenServicePort } from "../ports/TokenServicePort";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: UserRepository,
    @inject(TYPES.PasswordHasherPort) private hasher: PasswordHasherPort,
    @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort
  ) {}

  async execute(emailStr: string, password: string) {
    const email = new Email(emailStr);
    const user = await this.userRepo.findByEmail(email);

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


    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
      ...(user.companyId && { companyId: user.companyId }),
    });

    const refresh = await this.tokenService.generateRefreshToken(user.id!);

    return {
        user: {
    id: user.id!,
    fullName: user.fullName,
    email: user.email.getValue(),
    role: user.role.getValue(),
  },
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
