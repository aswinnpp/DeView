import { FastifyRequest, FastifyReply } from "fastify";
import { GoogleOAuthUseCase } from "../../../application/auth/use-cases/GoogleOAuthUseCase";
import { GoogleAuthService } from "../../../infrastructure/auth/GoogleAuthService";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../cookies/cookieHelper";

export class GoogleAuthController {
  constructor(
    private readonly googleOAuthUseCase: GoogleOAuthUseCase,
    private readonly googleAuthService: GoogleAuthService
  ) {}

  initiateAuth = async (
    _request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const authUrl = this.googleAuthService.getAuthUrl();
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
        role = parsed.role;
      } catch {}
    }

    const googleUser = await this.googleAuthService.verifyToken(code);

    const sessionId = await this.googleOAuthUseCase.execute(
      {
        email: googleUser.email,
        name: googleUser.name,
      },
      role
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
  };

  exchangeToken = async (
    request: FastifyRequest<{ Querystring: { sessionId: string } }>,
    reply: FastifyReply
  ) => {
    const result = await this.googleOAuthUseCase.exchange(
      request.query.sessionId
    );

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.refreshToken);

    reply.send({ user: result.user });
  };
}
