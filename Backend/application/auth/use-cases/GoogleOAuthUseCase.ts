import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { TokenServicePort } from "../ports/services/TokenServicePort";
import { OAuthSessionPort } from "../ports/services/OAuthSessionPort";
import { GoogleAuthPort } from "../ports/services/GoogleAuthPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { User } from "../../../domain/user/entities/User";
import { AppError } from "../../../shared/errors/AppError";
import { GoogleUserDTO } from "../dtos/GoogleUserDTO";
import { CryptoRandomPort } from "../../shared/ports/services/CryptoRandomPort";
import type { GoogleOAuthUseCasePort } from "../ports/usecase/GoogleOAuthUseCasePort";

const ALLOWED_ROLES = ["candidate", "company", "hr", "interviewer", "admin"];

function parseRoleFromState(state: string | undefined): string {
  if (!state) return "candidate";
  try {
    const parsed = JSON.parse(state);
    const role = parsed?.role;
    return typeof role === "string" && ALLOWED_ROLES.includes(role) ? role : "candidate";
  } catch {
    return "candidate";
  }
}

@injectable()
export class GoogleOAuthUseCase implements GoogleOAuthUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.TokenServicePort) private readonly tokenService: TokenServicePort,
    @inject(TYPES.OAuthSessionPort) private readonly sessionRepo: OAuthSessionPort,
    @inject(TYPES.GoogleAuthPort) private readonly googleAuth: GoogleAuthPort,
    @inject(TYPES.CryptoRandomPort) private readonly cryptoRandom: CryptoRandomPort
  ) {}

 
  async handleCallback(code: string | undefined, state?: string): Promise<string> {
    if (!code || !String(code).trim()) {
      throw AppError.badRequest("missing_code");
    }

    const role = parseRoleFromState(state);
    let googleUser: GoogleUserDTO;

    try {
      const verified = await this.googleAuth.verifyToken(code);
      googleUser = { email: verified.email, name: verified.name };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isExpired =
        message.includes("invalid_grant") || (message.includes("code") && message.toLowerCase().includes("expired"));
      throw AppError.unauthorized(isExpired ? "code_expired" : "auth_failed");
    }

    return this.execute(googleUser, role);
  }

  async execute(googleUser: GoogleUserDTO, role?: string) {
    const email = new Email(googleUser.email);
    const roleValue = role && ALLOWED_ROLES.includes(role) ? role : "candidate";
    const roleVO = new Role(roleValue);

    let user = await this.userRepo.findByEmail(email);

    if (!user) {
      user = User.create({
        fullName: googleUser.name || googleUser.email.split("@")[0],
        email,
        role: roleVO,
        authProvider: "google",
        createdAt: new Date(),
      });
      await this.userRepo.save(user);
      user = await this.userRepo.findByEmail(email);
      if (!user) throw AppError.internal("User creation failed");
    }

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
    });

    const refreshToken = await this.tokenService.generateRefreshToken(user.id!);

    const sessionId = this.cryptoRandom.generateUUID();

    await this.sessionRepo.save(sessionId, {
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id!,
        fullName: user.fullName,
        email: user.email.getValue(),
        role: user.role.getValue(),
      },
    });

    return sessionId;
  }

  async exchange(sessionId: string) {

    console.log("SESSION ID", sessionId);
    
    const session = await this.sessionRepo.get(sessionId);

    console.log("REDIS SESSION", session);

    if (!session) throw AppError.badRequest("Session expired");

    await this.sessionRepo.delete(sessionId);

    return JSON.parse(session);
  }
}
