import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
import { GoogleAuthService } from "../../../infrastructure/auth/GoogleAuthService";
import { SecureJwtTokenService } from "../../../infrastructure/security/SecureJwtTokenService";
import { MongoUserRepository } from "../../../infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { redisClient } from "../../../infrastructure/cache/RedisClient";

const ALLOWED_ROLES = ["candidate", "company", "hr", "interviewer","admin"];

export class GoogleAuthController {
  constructor(
    private googleAuthService: GoogleAuthService,
    private tokenService: SecureJwtTokenService,
    private userRepository: MongoUserRepository
  ) {}

  initiateAuth = async (
    request: FastifyRequest<{ Querystring: { role?: string } }>,
    reply: FastifyReply
  ) => {
    const role = ALLOWED_ROLES.includes(request.query.role || "")
      ? request.query.role
      : "candidate";

    const authUrl = this.googleAuthService.getAuthUrl(role);
    reply.redirect(authUrl);
  };

  handleCallback = async (
    request: FastifyRequest<{ Querystring: { code: string; state?: string } }>,
    reply: FastifyReply
  ) => {
    const { code, state } = request.query;

    let role = "candidate";

    if (state) {
      try {
        const parsed = JSON.parse(state);
        if (ALLOWED_ROLES.includes(parsed.role)) role = parsed.role;
      } catch {}
    }

    const googleUser = await this.googleAuthService.verifyToken(code);

    const email = new Email(googleUser.email);
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = User.create({
        fullName: googleUser.name,
        email,
        passwordHash: "",
        role: new Role(role),
        authProvider: "google",
      });

      user.markEmailAsVerified();
      await this.userRepository.save(user);

      user = await this.userRepository.findByEmail(email);
    }

    if (!user) throw new Error("User creation failed");

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
    });

    const refreshToken = await this.tokenService.generateRefreshToken(user.id!);

    const sessionId = crypto.randomUUID();

    await redisClient.setex(
      `oauth:session:${sessionId}`,
      300,
      JSON.stringify({
        accessToken,
        refreshToken: refreshToken.token,
        user: {
          id: user.id!,
          fullName: user.fullName,
          email: user.email.getValue(),
          role: user.role.getValue(),
        },
      })
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
  };

  exchangeToken = async (
    request: FastifyRequest<{ Querystring: { sessionId: string } }>,
    reply: FastifyReply
  ) => {
    const sessionData = await redisClient.get(
      `oauth:session:${request.query.sessionId}`
    );

    if (!sessionData) {
      reply.status(400).send({ error: "Session expired" });
      return;
    }

    await redisClient.del(`oauth:session:${request.query.sessionId}`);

    const { accessToken, refreshToken, user } = JSON.parse(sessionData);

    this.setAccessTokenCookie(reply, accessToken);
    this.setRefreshTokenCookie(reply, refreshToken);

    reply.send({ user });
  };

  private setAccessTokenCookie(reply: FastifyReply, token: string) {
    reply.header(
      "Set-Cookie",
      `accessToken=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`
    );
  }

  private setRefreshTokenCookie(reply: FastifyReply, token: string) {
    const cookie = `refreshToken=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;

    const existing = reply.getHeader("Set-Cookie");
    reply.header("Set-Cookie", existing ? [existing as string, cookie] : cookie);
  }
}
