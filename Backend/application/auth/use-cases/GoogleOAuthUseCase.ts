import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { TokenServicePort } from "../ports/TokenServicePort";
import { OAuthSessionPort } from "../ports/OAuthSessionPort";
import { GoogleAuthPort } from "../ports/GoogleAuthPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { User } from "../../../domain/user/entities/User";
import { AppError } from "../../../shared/errors/AppError";
import { GoogleUserDTO } from "../dtos/GoogleUserDTO";
import { CryptoRandomPort } from "../../shared/ports/CryptoRandomPort";

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
export class GoogleOAuthUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
    @inject(TYPES.TokenServicePort) private readonly tokenService: TokenServicePort,
    @inject(TYPES.OAuthSessionPort) private readonly sessionRepo: OAuthSessionPort,
    @inject(TYPES.GoogleAuthPort) private readonly googleAuth: GoogleAuthPort,
    @inject(TYPES.CryptoRandomPort) private readonly cryptoRandom: CryptoRandomPort
  ) {}

  /**
   * Handles OAuth callback: validates code, verifies with Google, creates/gets user, returns sessionId.
   * @throws AppError.badRequest("missing_code") when code is missing
   * @throws AppError.unauthorized("code_expired" | "auth_failed") when token verification fails
   */
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
