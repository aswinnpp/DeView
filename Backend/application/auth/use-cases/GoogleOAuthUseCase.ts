import crypto from "crypto";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { TokenServicePort } from "../ports/TokenServicePort";
import { OAuthSessionPort } from "../ports/OAuthSessionPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { User } from "../../../domain/user/entities/User";
import { AppError } from "../../../shared/errors/AppError";
import { GoogleUserDTO } from "../dtos/GoogleUserDTO";

const ALLOWED_ROLES = ["candidate", "company", "hr", "interviewer", "admin"];

export class GoogleOAuthUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenServicePort,
    private readonly sessionRepo: OAuthSessionPort
  ) {}

  async execute(googleUser: GoogleUserDTO, role?: string) {
   
    const email = new Email(googleUser.email);

    let user = await this.userRepo.findByEmail(email);


 

    if (!user) throw AppError.internal("User creation failed");

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
    });

    const refreshToken = await this.tokenService.generateRefreshToken(user.id!);

    const sessionId = crypto.randomUUID();

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
