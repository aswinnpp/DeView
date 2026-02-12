import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { TokenServicePort } from "../ports/TokenServicePort";

export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    private hasher: PasswordHasherPort,
    private tokenService: TokenServicePort
  ) {}

  async execute(emailStr: string, password: string) {
    const email = new Email(emailStr);
    const user = await this.userRepo.findByEmail(email);

    if (!user) throw new Error("Invalid credentials");
    if (!user.isEmailVerified) throw new Error("Email not verified");

    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

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
